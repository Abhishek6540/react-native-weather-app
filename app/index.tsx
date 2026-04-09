import { Text, View, ActivityIndicator, Keyboard, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

interface WeatherData {
  cod: number | string;
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
  }>;
  wind: {
    speed: number
  };
  sys: {
    sunrise: number;
    sunset: number
  };
  timezone: number;
}

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHERMAP_API_KEY || "";
const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.openweathermap.org/data/3.0/"
export default function Index() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeatherByCity = async () => {
    if (!city.trim()) {
      alert("Please enter a city name");
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setError("")
    try {
      const response = await fetch(`${API_URL}weather?q=${city}&appid=${API_KEY}&units=metric`);
      const data: WeatherData = await response.json();
      if (data.cod === 200) {
        setWeatherData(data);
        setError("");
      } else {
        setError(`Error: ${data.cod} - ${data.name}`);
        setWeatherData(null)
      }
    } catch (error) {
      setError("An error occurred while fetching weather data");
    } finally {
      setLoading(false)
    }
  }

  const getWeatherByLocation = async () => {
    setLoading(true);
    setError("")
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access location was denied");
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const response = await fetch(`${API_URL}weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${API_KEY}&units=metric`);
      const data: WeatherData = await response.json();
      if (data.cod === 200) {
        setWeatherData(data);
        setError("");
      } else {
        setError(`Error: ${data.cod} - ${data.name}`);
        setWeatherData(null)
      }
    } catch (error) {
      setError("An error occurred while fetching weather data");
    } finally {
      setLoading(false)
    }
  }
  const formatTime = (timestamp: number, timezone: number) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" , timeZone:"UTC"});
  }
  return (
    <View
      style={styles.container}
    >
      <Text style={styles.title}>Weather App</Text>

      <TextInput style={styles.input}
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
      />

      <TouchableOpacity style={styles.button} onPress={getWeatherByCity} >
        <Text style={styles.buttonText}>Get Weather</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.locationButton]} onPress={getWeatherByLocation} >
        <Text style={styles.buttonText}>Use Current Location</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#333" />}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {weatherData && (
        <View style={styles.card}>
          <Text style={styles.city}>{weatherData.name}</Text>
          <Text style={styles.temp}>{Math.round(weatherData.main.temp)}°C</Text>
          <Text style={styles.condition}>{weatherData.weather[0].main}</Text>
          <View style={styles.row}>
            <Text>Humidity: {weatherData.main.humidity}%</Text>
            <Text>Wind: {weatherData.wind.speed} m/s</Text>
          </View>
          <View style={styles.row}>
            <Text>Sunrise: {formatTime(weatherData.sys.sunrise, weatherData.timezone)}</Text>
            <Text>Sunset: {formatTime(weatherData.sys.sunset, weatherData.timezone)}</Text>
          </View>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "85%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    width: "85%",
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  locationButton: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  },
  card: {
    marginTop: 20,
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center"
  },
  city: {
    fontSize: 22,
    fontWeight: "bold",

  },
  temp: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 10,

  },
  condition: {
    fontSize: 18,
    color: "#555"
  },
  row: {
    marginTop: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  error: {
    color: "red",
    marginTop: 10
  }
})