<?php

namespace App\Filament\Admin\Resources\Users\Tables;

use App\Models\Driver;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Actions\Action;
use Illuminate\Support\Facades\DB;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable(),
                TextColumn::make('email_verified_at')
                    ->dateTime()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),

                // 👇 Add Assign as Driver
                Action::make('assign_driver')
                ->icon('heroicon-o-user-plus') // nice icon for adding a role
                ->tooltip('Promote this user to Driver') 
                    ->requiresConfirmation()
                    ->visible(fn($record) => !$record->hasRole('driver'))
                    ->action(function ($record) {
                        DB::transaction(function () use ($record) {
                            $record->assignRole('driver');

                            Driver::firstOrCreate([
                                'user_id' => $record->id,
                            ], [
                                'name' => $record->name,
                                'status' => 'available',
                            ]);
                        });
                    }),

                // 👇 Add Remove Driver
                Action::make('remove_driver')
                    ->label('Remove Driver Role')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->visible(fn($record) => $record->hasRole('driver'))
                    ->action(function ($record) {
                        DB::transaction(function () use ($record) {
                            $record->removeRole('driver');
                            $record->driver()?->delete();
                        });
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
