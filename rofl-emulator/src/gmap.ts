import axios from 'axios';

import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.GMAP_API_KEY;

export const generateCoordinatesFromLocationSeed = (seed: string) => {
    const hex = seed.slice(2);
    const latitude = parseInt(hex.slice(0, 16), 16) / (2 ** 64) * 180 - 90;
    const longitude = parseInt(hex.slice(16, 32), 16) / (2 ** 64) * 360 - 180;
    return { latitude, longitude };
}

async function fetchStreetViewImage(lat: number, lng: number): Promise<string> {
    const url = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${lat},${lng}&key=${API_KEY}`;
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
