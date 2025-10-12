<?php
namespace App\Services\Geo;

class GeofenceService {
    public function distance(float $lat1, float $lng1, float $lat2, float $lng2): float {
        $R = 6371000;
        $phi1=deg2rad($lat1); $phi2=deg2rad($lat2);
        $dphi=deg2rad($lat2-$lat1); $dl=deg2rad($lng2-$lng1);
        $a=sin($dphi/2)**2 + cos($phi1)*cos($phi2)*sin($dl/2)**2;
        return 2*$R*atan2(sqrt($a), sqrt(1-$a));
    }
    public function within(float $lat1,float $lng1,float $lat2,float $lng2,int $radiusM): bool {
        return $this->distance($lat1,$lng1,$lat2,$lng2) <= $radiusM;
    }
}
