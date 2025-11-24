<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseStatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseStatsOverviewWidget
{
    protected static ?int $sort = 1;

    public static function canView(): bool
    {
        return auth()->user()->hasRole('Admin');
    }

    protected function getStats(): array
    {
        $totalOrders = Order::count();
        $totalRevenue = Order::sum('total');
        $totalUsers = User::count();
        $totalProducts = Product::where('status', 'active')->count();

        // Calculate trends (comparing with previous period)
        $previousMonthOrders = Order::where('created_at', '<', now()->subMonth())->count();
        $ordersTrend = $previousMonthOrders > 0 
            ? (($totalOrders - $previousMonthOrders) / $previousMonthOrders) * 100 
            : 0;

        return [
            Stat::make('Total Orders', number_format($totalOrders))
                ->description($ordersTrend > 0 ? "+{$ordersTrend}% from last period" : "{$ordersTrend}% from last period")
                ->descriptionIcon($ordersTrend > 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->color($ordersTrend > 0 ? 'success' : 'danger')
                ->chart([7, 3, 4, 5, 6, 3, 5, 3]),

            Stat::make('Total Revenue', '$' . number_format($totalRevenue, 2))
                ->description('Lifetime revenue')
                ->descriptionIcon('heroicon-m-currency-dollar')
                ->color('success')
                ->chart([7, 2, 10, 3, 15, 4, 17]),

            Stat::make('Total Users', number_format($totalUsers))
                ->description('Registered users')
                ->descriptionIcon('heroicon-m-user-group')
                ->color('primary')
                ->chart([1, 2, 3, 4, 5, 6, 7]),

            Stat::make('Active Products', number_format($totalProducts))
                ->description('Products in stock')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('warning')
                ->chart([5, 4, 6, 5, 3, 5, 4]),
        ];
    }
}
