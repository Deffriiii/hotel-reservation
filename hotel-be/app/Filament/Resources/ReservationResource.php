<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ReservationResource\Pages;
use App\Models\Reservation;
use App\Models\Room;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Carbon\Carbon;
use Filament\Forms\Get;
use Filament\Forms\Set;

class ReservationResource extends Resource
{
    protected static ?string $model = Reservation::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Grid::make(2)
                    ->schema([
                        Forms\Components\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\Select::make('room_id')
                            ->relationship('room', 'number')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->afterStateUpdated(function ($state, Set $set, Get $get) {
                                if ($state) {
                                    static::updateTotalPrice($state, $set, $get);
                                }
                            }),
                        Forms\Components\Select::make('hotel_id')
                            ->relationship('room.hotel', 'name') // Pastikan hubungan ke hotel melalui room
                            ->searchable()
                            ->preload()
                            ->required(),
                        Forms\Components\DatePicker::make('check_in')
                            ->required()
                            ->minDate(now())
                            ->afterStateUpdated(function ($state, Set $set, Get $get) {
                                if ($state) {
                                    $set('check_out', null); // Reset check_out when check_in changes
                                    static::updateTotalPrice($get('room_id'), $set, $get);
                                }
                            }),
                        Forms\Components\DatePicker::make('check_out')
                            ->required()
                            ->minDate(fn (Get $get): Carbon => Carbon::parse($get('check_in'))?->addDay() ?? now()->addDay())
                            ->afterStateUpdated(function ($state, Set $set, Get $get) {
                                if ($state) {
                                    static::updateTotalPrice($get('room_id'), $set, $get);
                                }
                            }),
                        Forms\Components\TextInput::make('guest_count')
                            ->required()
                            ->numeric()
                            ->minValue(1)
                            ->default(1)
                            ->afterStateUpdated(function ($state, Set $set, Get $get) {
                                if ($state) {
                                    static::updateTotalPrice($get('room_id'), $set, $get);
                                }
                            }),
                        Forms\Components\TextInput::make('total_price')
                            ->required()
                            ->numeric()
                            ->prefix('Rp')
                            ->disabled()
                            ->dehydrated()
                            ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.')),
                        Forms\Components\Select::make('status')
                            ->options([
                                'pending' => 'Pending',
                                'confirmed' => 'Confirmed',
                                'cancelled' => 'Cancelled',
                                'completed' => 'Completed',
                            ])
                            ->required()
                            ->default('pending'),
                        Forms\Components\Textarea::make('special_requests')
                            ->maxLength(65535)
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    protected static function updateTotalPrice($roomId, Set $set, Get $get): void
    {
        if (!$roomId) return;

        $room = Room::find($roomId);
        if (!$room) return;

        $checkIn = $get('check_in');
        $checkOut = $get('check_out');
        $guestCount = $get('guest_count');

        if (!$checkIn || !$checkOut || !$guestCount) return;

        try {
            $checkInDate = Carbon::parse($checkIn);
            $checkOutDate = Carbon::parse($checkOut);
            $numberOfNights = $checkOutDate->diffInDays($checkInDate);

            if ($numberOfNights < 1) {
                $set('check_out', null);
                return;
            }

            $totalPrice = $room->price * $guestCount * $numberOfNights;
            $set('total_price', $totalPrice);
        } catch (\Exception $e) {
            // Handle error silently
            $set('total_price', 0);
        }
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                
                Tables\Columns\TextColumn::make('room.hotel.name') // Menampilkan nama hotel dari relasi room
                ->searchable()
                ->sortable(),
                Tables\Columns\TextColumn::make('user.name')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('room.number')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('check_in')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('check_out')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('guest_count')
                    ->sortable(),
                Tables\Columns\TextColumn::make('total_price')
                    ->money('idr')
                    ->sortable(),
                Tables\Columns\BadgeColumn::make('status')
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'confirmed',
                        'danger' => 'cancelled',
                        'primary' => 'completed',
                    ]),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'cancelled' => 'Cancelled',
                        'completed' => 'Completed',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
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
            'index' => Pages\ListReservations::route('/'),
            'create' => Pages\CreateReservation::route('/create'),
            'edit' => Pages\EditReservation::route('/{record}/edit'),
        ];
    }
}