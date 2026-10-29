import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Home as HomeLayout } from './layout/home/home';
import { Productslist } from './layout/productslist/productslist';
import { ProductDetails } from './layout/productslist/product-details/product-details';
import { CartComponent } from './layout/cart/cart';
import { CheckoutComponent } from './layout/checkout/checkout';
import { Userprofile } from './layout/userprofile/userprofile';
import { FaqComponent } from './layout/faq/faq';
import { PoliciesComponent } from './layout/policies/policies';
import { AboutComponent } from './layout/about/about';
import { ContactComponent } from './layout/contact/contact';
import { Login } from './layout/login/login';
import { Signup } from './layout/signup/signup';
import { NotFound } from './shared/not-found/not-found';

import { Dashboard } from './dashboard/dashboard';
import { Home as DashboardHome } from './dashboard/home/home';
import { DashboardOrders } from './dashboard/orders/orders';
import { DashboardProducts } from './dashboard/products/products';
import { DashboardCategories } from './dashboard/categories/categories';
import { UserList } from './dashboard/user-list/user-list';
import { DashboardTestimonials } from './dashboard/testimonials/testimonials';
import { DashboardFaqs } from './dashboard/faqs/faqs';

import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { deactivateGuard } from './core/guards/deactivate-guard';
import { ProductDetailsResolver } from './core/resolvers/product-details.resolver';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeLayout },
      { path: 'product-list', component: Productslist },
      {
        path: 'product-list/:slug',
        component: ProductDetails,
        resolve: {
          productRes: ProductDetailsResolver
        }
      },
      { path: 'cart', component: CartComponent },
      { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
      { path: 'user-profile', component: Userprofile, canActivate: [authGuard] },
      { path: 'faq', component: FaqComponent },
      { path: 'policies', component: PoliciesComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'login', component: Login },
      { path: 'signup', component: Signup, canDeactivate: [deactivateGuard] }
    ]
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: DashboardHome },
      { path: 'orders', component: DashboardOrders },
      { path: 'products', component: DashboardProducts },
      { path: 'categories', component: DashboardCategories },
      { path: 'user-list', component: UserList },
      { path: 'testimonials', component: DashboardTestimonials },
      { path: 'faqs', component: DashboardFaqs }
    ]
  },
  { path: '**', component: NotFound }
];
