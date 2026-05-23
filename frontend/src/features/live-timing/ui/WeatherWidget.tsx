'use client';

import type { WeatherData } from '../types/timing.types';
import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react';

interface Props {
  weather?: WeatherData;
}

export function WeatherWidget({ weather }: Props) {
  if (!weather) return null;

  const isRaining = weather.Rainfall === true || weather.Rainfall === 'true' || weather.Rainfall === '1';

  return (
    <div className="bg-card border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Weather
        </h3>
        {isRaining && (
          <span className="flex items-center gap-1 text-blue-400 text-xs font-medium">
            <CloudRain className="w-3.5 h-3.5" />
            Rain
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {weather.AirTemp && (
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Air</p>
              <p className="font-mono font-semibold text-sm">{weather.AirTemp}°C</p>
            </div>
          </div>
        )}

        {weather.TrackTemp && (
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-red-400 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Track</p>
              <p className="font-mono font-semibold text-sm">{weather.TrackTemp}°C</p>
            </div>
          </div>
        )}

        {weather.Humidity && (
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Humidity</p>
              <p className="font-mono font-semibold text-sm">{weather.Humidity}%</p>
            </div>
          </div>
        )}

        {weather.WindSpeed && (
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Wind</p>
              <p className="font-mono font-semibold text-sm">{weather.WindSpeed} m/s</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
