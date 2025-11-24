<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class RevenueChartWidget extends ChartWidget
{
    protected ?string $heading = 'Revenue Over Time';
    protected static ?int $sort = 3;

    public static function canView(): bool
    {
        return auth()->user()->hasRole('Admin');
    }

    protected function getData(): array
    {
        // Get revenue for the last 30 days
        $revenue = Order::where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, SUM(total) as total_revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Create array of last 30 days
        $labels = [];
        $data = [];
        
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $labels[] = now()->subDays($i)->format('M d');
            
            // Find revenue for this date
            $dailyRevenue = $revenue->where('date', $date)->first();
            $data[] = $dailyRevenue ? (float) $dailyRevenue->total_revenue : 0;
        }

        return [
            'datasets' => [
                [
                    'label' => 'Revenue ($)',
                    'data' => $data,
                    'borderColor' => 'rgb(34, 197, 94)',
                    'backgroundColor' => 'rgba(34, 197, 94, 0.1)',
                    'fill' => true,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'display' => true,
                ],
            ],
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => [
                        'callback' => 'function(value) { return "$" + value.toFixed(2); }',
                    ],
                ],
            ],
        ];
    }
}
