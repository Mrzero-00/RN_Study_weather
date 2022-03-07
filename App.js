import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator ,ScrollView ,Dimensions} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons'; 
import { Axios } from 'axios';

const {width:CurrentWidth} = Dimensions.get("window");
const ApiKey = "706fc4dc28118b00979c7955b03d422f";

const RenderWeather =({item})=>{
  const icons={
    Clear:"sunny",
    Rain:"rainy",
    Clouds:"cloud",
    Snow:"snow",
    Thunderstorm:"thunderstorm",
    Drizzle:"rainy",
    Atmosphere:"cloud"

  }
  return(
    <View style={styles.tempBox}>
      <Text style={styles.tempStateText}>{item.weather[0].main}</Text>
      <Text style={styles.tempText}>{parseFloat(item.temp.day).toFixed(1)}℃</Text>
      <Ionicons name={icons[item.weather[0].main]} size={24} color="black" />
    </View> 
  )
}

export default function App() {
  const [isOk , setIsOk] = useState(false);
  const [currentCity,setCurrentCity] = useState("loading...");
  const [dailyWeather , setDailyWeather] = useState([]);
  const getLocation = async()=>{
    const {granted:Permation} = await Location.requestForegroundPermissionsAsync();
    //위치 정보 읽을 수 있도록 승인받는 코드
    if(!Permation){
      setIsOk(false);
    }else{
      const {coords:{latitude,longitude}} = await Location.getCurrentPositionAsync({});
      const currnetCity = await Location.reverseGeocodeAsync(
        {latitude,longitude},
        {useGoogleMaps:false}
        );
        setCurrentCity(currnetCity[0].city);
        getWeather(latitude,longitude);
    }
  }

  const getWeather = async(latitude,longitude)=>{
    console.log(latitude,longitude,ApiKey);
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${ApiKey}&units=metric`);
    const json = await response.json();
    setDailyWeather(json.daily);
    console.log(json);
    setIsOk(true);
  }

  useEffect(()=>{
    getLocation();
  },[])
  return (
    <View style={styles.container}>
      {isOk&&<View style={styles.container}>
        <View style={styles.cityBox}>
          <Text style={styles.cityText}>{currentCity}</Text>
        </View>
        <View style={{flex:2}}>
          <ScrollView
          //스크롤뷰는 레이아웃의 개념이 아닌 스크롤 기능을 가능하게 해주는 컴포넌트라고 생각하자. 만약 스크롤뷰의 크기만큼 레이아웃이 필요하다면 view를통해 감싸고 그 view에 레아아웃을 설정해줘야함.
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          contentContainerStyle={styles.scrollView}>
            {isOk&&dailyWeather.map((item,index)=>(<RenderWeather item={item} key={index}></RenderWeather>))}
          </ScrollView>
        </View>
      </View>}
      {!isOk&&<View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
        <ActivityIndicator color="black" size="large"></ActivityIndicator>
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"orange"
  },
  cityBox:{
    flex: 1,
    alignItems:"center",
    justifyContent:"center"
  },
  cityText:{
    fontSize:48,
    fontWeight:"600",
    marginTop:50,
  },
  tempBox:{
    width:CurrentWidth,
    alignItems:"center"
  },
  tempText:{
    fontSize:80
  },
  tempStateText:{
    marginTop:80,
    fontSize:50
  },
  scrollView:{
    //스크롤 뷰에서는 flex를 먹이면 화면크기만큼 크기가 설정되서 스크롤이 넘어가지않는 문제가 생김. 하여 flex를 제거해야하는데 그럼 플렉스가 유지되는 방법은 뭐지..?
     //backgroundColor:"#ff0"
  }

});
