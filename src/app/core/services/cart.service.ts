import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { AuthService } from './auth.service';
import { ICart, ICartItem, ICartRes } from '../models/cart.model';
import { IProduct } from '../models/product.model';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private _http = inject(HttpClient);
    private _auth = inject(AuthService);
    private _apiURL = enveronment.apiURL + 'cart';
    private guestCartKey = 'guest_cart';

    private cartSubject = new BehaviorSubject<ICart>({
        products: [],
        hasPriceChange: false,
        totalQuantity: 0,
        subtotal: 0
    });

    cart$ = this.cartSubject.asObservable();
    itemCount$ = this.cart$.pipe(map(c => c.totalQuantity));
    subtotal$ = this.cart$.pipe(map(c => c.subtotal));
    hasPriceChange$ = this.cart$.pipe(map(c => c.hasPriceChange));

    constructor() {
        this.initializeCart();

        // Listen to login/logout state changes
        this._auth.getUserData().subscribe(user => {
            if (user) {
                this.syncGuestCartToBackend();
            } else {
                this.loadGuestCart();
            }
        });

        // Cross-tab guest cart synchronization
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (event: StorageEvent) => {
                if (event.key === this.guestCartKey && !this._auth.isLoggedIn()) {
                    this.loadGuestCart();
                }
            });
        }
    }

    private initializeCart() {
        if (this._auth.isLoggedIn()) {
            this.fetchBackendCart().subscribe();
        } else {
            this.loadGuestCart();
        }
    }

    private loadGuestCart() {
        try {
            const raw = localStorage.getItem(this.guestCartKey);
            if (raw) {
                const parsed: ICartItem[] = JSON.parse(raw);
                const totalQuantity = parsed.reduce((sum, item) => sum + item.quantity, 0);
                const subtotal = parsed.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
                const hasPriceChange = parsed.some(item => item.isPriceChanged);
                this.cartSubject.next({
                    products: parsed,
                    hasPriceChange,
                    totalQuantity,
                    subtotal
                });
                return;
            }
        } catch (e) {}

        this.cartSubject.next({
            products: [],
            hasPriceChange: false,
            totalQuantity: 0,
            subtotal: 0
        });
    }

    private saveGuestCart(items: ICartItem[]) {
        localStorage.setItem(this.guestCartKey, JSON.stringify(items));
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = items.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
        const hasPriceChange = items.some(item => item.isPriceChanged);
        this.cartSubject.next({
            products: items,
            hasPriceChange,
            totalQuantity,
            subtotal
        });
    }

    fetchBackendCart() {
        return this._http.get<ICartRes>(this._apiURL).pipe(
            tap(res => {
                if (res.data) {
                    this.cartSubject.next(res.data);
                }
            })
        );
    }

    syncGuestCartToBackend() {
        try {
            const raw = localStorage.getItem(this.guestCartKey);
            if (raw) {
                const guestItems: ICartItem[] = JSON.parse(raw);
                if (guestItems.length > 0) {
                    const payload = guestItems.map(i => ({
                        productId: i.productId,
                        quantity: i.quantity,
                        cartPrice: i.cartPrice || i.currentPrice
                    }));
                    this._http.post<ICartRes>(this._apiURL + '/sync', { items: payload }).subscribe({
                        next: (res) => {
                            localStorage.removeItem(this.guestCartKey);
                            if (res.data) this.cartSubject.next(res.data);
                        },
                        error: () => this.fetchBackendCart().subscribe()
                    });
                    return;
                }
            }
        } catch (e) {}

        this.fetchBackendCart().subscribe();
    }

    addToCart(product: IProduct, quantity: number = 1): Observable<any> {
        if (product.stock <= 0) return of(null);

        if (this._auth.isLoggedIn()) {
            return this._http.post<ICartRes>(this._apiURL + '/add', {
                productId: product._id,
                quantity
            }).pipe(
                tap(res => {
                    if (res.data) this.cartSubject.next(res.data);
                })
            );
        } else {
            // Guest mode
            const current = [...this.cartSubject.value.products];
            const existingIndex = current.findIndex(i => i.productId === product._id);
            if (existingIndex > -1) {
                const newQty = Math.min(current[existingIndex].quantity + quantity, product.stock);
                current[existingIndex].quantity = newQty;
                current[existingIndex].itemSubtotal = current[existingIndex].currentPrice * newQty;
            } else {
                current.push({
                    productId: product._id,
                    productDetails: product,
                    quantity: Math.min(quantity, product.stock),
                    cartPrice: product.price,
                    currentPrice: product.price,
                    isPriceChanged: false,
                    itemSubtotal: product.price * Math.min(quantity, product.stock)
                });
            }
            this.saveGuestCart(current);
            return of(this.cartSubject.value);
        }
    }

    updateQuantity(productId: string, quantity: number): Observable<any> {
        if (this._auth.isLoggedIn()) {
            return this._http.put<ICartRes>(this._apiURL + '/update', {
                productId,
                quantity
            }).pipe(
                tap(res => {
                    if (res.data) this.cartSubject.next(res.data);
                })
            );
        } else {
            let current = [...this.cartSubject.value.products];
            if (quantity <= 0) {
                current = current.filter(i => i.productId !== productId);
            } else {
                const item = current.find(i => i.productId === productId);
                if (item) {
                    const maxStock = item.productDetails?.stock ?? 99;
                    item.quantity = Math.min(quantity, maxStock);
                    item.itemSubtotal = item.currentPrice * item.quantity;
                }
            }
            this.saveGuestCart(current);
            return of(this.cartSubject.value);
        }
    }

    removeFromCart(productId: string): Observable<any> {
        if (this._auth.isLoggedIn()) {
            return this._http.delete<ICartRes>(this._apiURL + '/item/' + productId).pipe(
                tap(res => {
                    if (res.data) this.cartSubject.next(res.data);
                })
            );
        } else {
            const current = this.cartSubject.value.products.filter(i => i.productId !== productId);
            this.saveGuestCart(current);
            return of(this.cartSubject.value);
        }
    }

    clearCart(): Observable<any> {
        if (this._auth.isLoggedIn()) {
            return this._http.delete<ICartRes>(this._apiURL + '/clear').pipe(
                tap(() => {
                    this.cartSubject.next({
                        products: [],
                        hasPriceChange: false,
                        totalQuantity: 0,
                        subtotal: 0
                    });
                })
            );
        } else {
            localStorage.removeItem(this.guestCartKey);
            this.cartSubject.next({
                products: [],
                hasPriceChange: false,
                totalQuantity: 0,
                subtotal: 0
            });
            return of(null);
        }
    }

    acceptPriceChange(productId: string): Observable<any> {
        if (this._auth.isLoggedIn()) {
            return this._http.post<ICartRes>(this._apiURL + '/accept-price-change', { productId }).pipe(
                tap(res => {
                    if (res.data) this.cartSubject.next(res.data);
                })
            );
        } else {
            const current = [...this.cartSubject.value.products];
            const item = current.find(i => i.productId === productId);
            if (item) {
                item.cartPrice = item.currentPrice;
                item.isPriceChanged = false;
            }
            this.saveGuestCart(current);
            return of(this.cartSubject.value);
        }
    }
}
