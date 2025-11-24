<?php

namespace App\Filament\Admin\Pages;

use App\Models\Order;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Actions\Action;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Illuminate\Support\Facades\DB;


class AvailableOrders extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $title = 'Available Orders';

    protected string $view = 'filament.admin.pages.available-orders';

    protected function getTableQuery()
    {
        // Fetch orders that are "paid" but not yet assigned to any driver
        return Order::query()
            ->where('status', 'paid')
            ->whereDoesntHave('deliveryStatusHistories', fn ($q) => $q->where('status', 'assigned'));

            
    }

    protected function getTableColumns(): array
    {
        return [
            Tables\Columns\TextColumn::make('id')
                ->label('Order ID')
                ->sortable(),
            Tables\Columns\TextColumn::make('total')
                ->label('Total')
                ->money('ETB'),
            Tables\Columns\TextColumn::make('shippingAddress.address_line')
                ->label('Address')
                ->default('-'),
            Tables\Columns\TextColumn::make('created_at')
                ->label('Placed At')
                ->dateTime()
                ->sortable(),
        ];
    }

    protected function getTableActions(): array
    {
        return [
            Action::make('pick')
                ->label('Pick Order')
                ->color('success')
                ->requiresConfirmation()
                ->action(function (Order $record) {
                    $driver = auth()->user()->driver;

           

                    DB::transaction(function () use ($record, $driver) {
                        // Assign order to driver
                        $record->deliveryStatusHistories()->create([
                            'driver_id' => $driver->id,
                            'status' => 'assigned',
                            'changed_at' => now(),
                        ]);
                    });

                    redirect()->away(route('order.track', ['order' => $record->id]));
                }),
        ];
    }

    public static function canView(): bool
    {
        return auth()->user()->hasRole('driver');
    }
    
}
