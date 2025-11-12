<?php

namespace App\Filament\Admin\Resources\Drivers\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class DriverForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('user_id')
                    ->required()
                    ->numeric(),
                TextInput::make('phone')
                    ->tel(),
                Select::make('status')
                    ->options(['available' => 'Available', 'busy' => 'Busy', 'offline' => 'Offline'])
                    ->default('available')
                    ->required(),
                TextInput::make('current_lat')
                    ->numeric(),
                TextInput::make('current_lng')
                    ->numeric(),
                DateTimePicker::make('last_active_at'),
            ]);
    }
}
