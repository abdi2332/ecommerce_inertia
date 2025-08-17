<?php

namespace App\Filament\Admin\Resources\ProductImages\Schemas;

use Filament\Schemas\Schema;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Checkbox;


class ProductImagesForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('product_id')
                    ->relationship('product', 'name')
                    ->required()
                    ->searchable(),
                FileUpload::make('image_path')
                    ->label('Image')
                    ->required()
                    ->image()
                    ->disk('public')
                    ->directory('product_images')
                    ->visibility('public'),
                Checkbox::make('is_primary')
                    ->label('Is Primary')
                    ->default(false)
                    ->columnSpanFull(),                
            ]);
    }
}
