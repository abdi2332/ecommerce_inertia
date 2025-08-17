<?php

namespace App\Filament\Admin\Resources\ProductImages\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\BooleanColumn;

class ProductImagesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
              TextColumn::make('id')->label('ID'),
              TextColumn::make('product.name')->label('Product Name'),
              ImageColumn::make('image_path')->label('Image'),
            
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
