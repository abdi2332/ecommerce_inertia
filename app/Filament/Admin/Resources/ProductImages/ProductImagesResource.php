<?php

namespace App\Filament\Admin\Resources\ProductImages;

use App\Filament\Admin\Resources\ProductImages\Pages\CreateProductImages;
use App\Filament\Admin\Resources\ProductImages\Pages\EditProductImages;
use App\Filament\Admin\Resources\ProductImages\Pages\ListProductImages;
use App\Filament\Admin\Resources\ProductImages\Schemas\ProductImagesForm;
use App\Filament\Admin\Resources\ProductImages\Tables\ProductImagesTable;
use App\Models\ProductImages;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ProductImagesResource extends Resource
{
    protected static ?string $model = ProductImages::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'images';

    public static function form(Schema $schema): Schema
    {
        return ProductImagesForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ProductImagesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListProductImages::route('/'),
            'create' => CreateProductImages::route('/create'),
            'edit' => EditProductImages::route('/{record}/edit'),
        ];
    }
}
