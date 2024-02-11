import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    KeyboardAvoidingView,
    Platform
  } from "react-native";
  import React, { useCallback, useEffect, useState } from "react";
  import {
    CalendarDaysIcon,
    MagnifyingGlassIcon,
  } from "react-native-heroicons/outline";
  import { MapPinIcon } from "react-native-heroicons/solid";
  import GlobalStyles from "../GlobalStyles";
  import { theme } from "../theme";
  import { StatusBar } from "react-native";
  import { debounce } from "lodash";
  import { fetchLocations, fetchWeatherForecast } from "../api/Weather";
  import { weatherImages } from "../constants";
  import * as Progress from "react-native-progress";
  import { storeData, getData } from "../utils/asyncStorage";
  const HomeScreen = () => {
    const [showSearch, toggleSearch] = useState(false);
    const [locations, setLocations] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true);
    const [isClicked, setIsClicked] = useState(false);
  
   const handleLocation = (loc) => {
      setLocations([]);
      toggleSearch(false);
      setLoading(true);
      fetchWeatherForecast({ cityName: loc.name, days: "7" }).then((data) => {
        setWeather(data);
  
        setLoading(false);
        storeData("city", loc.name);
      });
      setIsClicked(true);
    };
    const handleSearch = (value) => {
      if (value.length > 2) {
        fetchLocations({ cityName: value }).then((data) => {
          setLocations(data);
        });
      }
    };
  
    useEffect(() => {
      fetchMyWeather();
    }, []);
  
    const fetchMyWeather = async () => {
      let myCity = await getData("city");
      let cityName = "London";
      if (myCity) cityName = myCity;
      fetchWeatherForecast({ cityName, days: "7" }).then((data) => {
        setWeather(data);
        setLoading(false);
      });
    };
    const handleTextDebounce = useCallback(debounce(handleSearch, 600), []);
    const { current, location } = weather;
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : 10 }
        enabled
      >
        <View className="flex-1 relative" style={{marginTop : 40}}>
          <Image
            source={require("../assets/images/bg.png")}
            className="absolute h-full w-full"
            blurRadius={70}
          />
          {loading ? (
            <View className="flex-1 flex-row justify-center items-center">
              <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
            </View>
          ) : (
            <View
              className="flex flex-1 "
              style={{
                marginTop: 10,
              }}
            >
              <View style={{ height: "7%" }} className="mx-4 relative z-50">
                <View
                  className=" flex-row justify-end items-center rounded-full"
                  style={{
                    backgroundColor: showSearch
                      ? theme.bgWhite(0.2)
                      : "transparent",
                  }}
                >
                  {showSearch ? (
                    <TextInput
                      placeholder="Search city"
                      placeholderTextColor={"lightgray"}
                      className="pl-6 h-12 flex-1 text-base text-white"
                      onChangeText={handleTextDebounce}
                      onPressIn={() => setIsClicked(true)}
                    />
                  ) : null}
  
                  <TouchableOpacity
                    onPress={() => toggleSearch(!showSearch)}
                    style={{
                      backgroundColor: theme.bgWhite(0.3),
                    }}
                    className="rounded-full p-3 m-1"
                  >
                    <MagnifyingGlassIcon color="white" size={25} />
                  </TouchableOpacity>
                </View>
                {locations.length > 0 && showSearch ? (
                  <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                    {locations.map((loc, index) => {
                      let showBorder = index + 1 != locations.length;
                      let borderClass = showBorder
                        ? "border-b-2 border-b-gray-400"
                        : "";
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            handleLocation(loc);
                            setIsClicked(false);
                          }}
                          key={index}
                          className={
                            "flex-row items-center border-0 p-3 px-4 mb-1 " +
                            borderClass
                          }
                        >
                          <MapPinIcon size={20} color="gray" />
                          <Text className="text-black text-lg ml-2">
                            {loc?.name} , {loc?.country}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : null}
              </View>
              {isClicked ? null : (
                <View className="mx-4 flex justify-around flex-1 mb-2">
                  <Text className="text-white text-center text-2xl font-bold ">
                    {location?.name},
                    <Text className="text-lg font-semibold text-gray-300">
                      {" " + location?.country}
                    </Text>
                  </Text>
  
                  <View className="flex-row justify-center">
                    <Image
                      source={weatherImages[current?.condition?.text]}
                      className="w-52 h-52"
                    />
                  </View>
                  <View className="space-y-2">
                    <Text className="text-white text-center text-6xl font-bold ml-5 ">
                      {current?.temp_c}&#176;
                    </Text>
                    <Text className="text-white text-center text-xl  tracking-widset">
                      {current?.condition?.text}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mx-4">
                    <View className="flex-row items-center space-x-2">
                      <Image
                        source={require("../assets/icons/wind.png")}
                        className="h-6 w-6 "
                      />
                      <Text className="text-white font-semibold text-base">
                        {current?.wind_kph} km/h
                      </Text>
                    </View>
                    <View className="flex-row items-center space-x-2">
                      <Image
                        source={require("../assets/icons/drop.png")}
                        className="h-6 w-6 "
                      />
                      <Text className="text-white font-semibold text-base">
                        {current?.humidity} %
                      </Text>
                    </View>
                    <View className="flex-row items-center space-x-2">
                      <Image
                        source={require("../assets/icons/sun.png")}
                        className="h-6 w-6 "
                      />
                      <Text className="text-white font-semibold text-base">
                        {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              {isClicked ? null : (
                <View className="mb-2 space-y-3">
                  <View className="flex-row items-center mx-5 space-x-2">
                    <CalendarDaysIcon size={22} color="white" />
                    <Text className="text-white  text-base">Daily forecasr </Text>
                  </View>
                  <TouchableOpacity>
                  <ScrollView
                    horizontal
                    contentContainerStyle={{ paddingHorizontal: 15 }}
                    showHorizontalScrollIndicator={false}
                  >
                    {weather.forecast?.forecastday?.map((item, index) => {
                      let date = new Date(item.date);
                      let options = { weekday: "long" };
                      let dayName = date.toLocaleDateString("en-US", options);
                      dayName = dayName.split(",")[0];
                      return (
                        <View
                          key={index}
                          className="flex justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                          style={{ backgroundColor: theme.bgWhite(0.15) }}
                        > 
                          <Image
                            source={weatherImages[item?.day?.condition?.text]}
                            className="h-11 w-11 "
                          />
                          <Text className="text-white text-base">{dayName}</Text>
                          <Text className="text-white text-xl font-semibold">
                            {item?.day?.avgtemp_c}&#176;
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  };
  
  export default HomeScreen;
  
  const styles = StyleSheet.create({});
  