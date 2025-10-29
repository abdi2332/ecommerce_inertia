<?php

namespace App\Filament\Admin\Resources\Orders\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('user_id')
                    ->numeric(),
                Select::make('status')
                    ->options([
            'pending' => 'Pending',
            'paid' => 'Paid',
            'failed' => 'Failed',
            'cancelled' => 'Cancelled',
            'delivered' => 'Delivered',
        ])
                    ->default('pending')
                    ->required(),
                Select::make('payment_method')
                    ->options(['chapa' => 'Chapa', 'telebirr' => 'Telebirr', 'cod' => 'Cod']),
                Select::make('payment_status')
                    ->options([
            'unpaid' => 'Unpaid',
            'processing' => 'Processing',
            'paid' => 'Paid',
            'failed' => 'Failed',
            'refunded' => 'Refunded',
        ])
                    ->default('unpaid')
                    ->required(),
                TextInput::make('subtotal')
                    ->required()
                    ->numeric(),
                TextInput::make('discount')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('tax')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('shipping_fee')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('payment_fee')
                    ->required()
                    ->numeric()
                    ->default(0.0),
                TextInput::make('total')
                    ->required()
                    ->numeric(),
                TextInput::make('shipping_address_id')
                    ->numeric(),
            ]);
    }

    
}
