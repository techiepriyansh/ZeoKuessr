import axios from 'axios';

import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GMAP_API_KEY;

const CENTER_LATITUDE = 48.86432706201461;
const CENTER_LONGITUDE = 2.347093922859318;
const RADIUS = 0.1;

export const generateCoordinatesFromLocationSeed = (seed: string) => {
    const hex = seed.slice(2);
    let latitude = parseInt(hex.slice(0, 16), 16) / (2 ** 64) * 180 - 90;
    let longitude = parseInt(hex.slice(16, 32), 16) / (2 ** 64) * 360 - 180;
    latitude = CENTER_LATITUDE + latitude/180 * RADIUS;
    longitude = CENTER_LONGITUDE + longitude/360 * RADIUS;
    return { latitude, longitude };
}

export const getDistanceBwLocationSeeds = (seed1: string, seed2: string) => {
    const { latitude: lat1, longitude: lng1 } = generateCoordinatesFromLocationSeed(seed1);
    const { latitude: lat2, longitude: lng2 } = generateCoordinatesFromLocationSeed(seed2);
    const R = 6371e3; // km

    const phi = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;

}

async function fetchStreetViewImage(lat: number, lng: number): Promise<string> {
    const url = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&key=${API_KEY}`;
    console.log(url);
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        if (response.status === 200) {
            const base64Image = Buffer.from(response.data, 'binary').toString('base64');
            return base64Image;
        } else {
            console.log('[ERROR] Error fetching the street view image');
        }
    } catch (error) {
        console.log(`[ERROR] ${error}`);
    }
}

export const gmapMain = async (locationSeed: string) => {
    const { latitude, longitude } = generateCoordinatesFromLocationSeed(locationSeed);
    console.log(`[INFO] Fetching street view image for latitude: ${latitude}, longitude: ${longitude}`);
    const imageBase64 = await fetchStreetViewImage(latitude, longitude);
    return imageBase64;
}
