import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { divIcon } from "leaflet";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import moment, { Moment, tz } from "moment-timezone";

import { Data } from "./types";
import { delay, getRandomFloatInRange, getRandomNumberInRange } from "./utils";
import "leaflet/dist/leaflet.css";
import "./App.css";

const temperatureRanges = [
  { maxTemp: 0, colorClass: "blue-400", colorCode: "#60CCFA" },
  { maxTemp: 10, colorClass: "blue-500", colorCode: "#3B82F6" },
  { maxTemp: 20, colorClass: "blue-600", colorCode: "#2563EB" },
  { maxTemp: 25, colorClass: "blue-700", colorCode: "#1D4ED8" },
  { maxTemp: 30, colorClass: "blue-800", colorCode: "#1D7CD8" },
  { maxTemp: 40, colorClass: "orange-800", colorCode: "#9a3412" },
  { maxTemp: 50, colorClass: "orange-900", colorCode: "#7c2d12" },
  { maxTemp: Infinity, colorClass: "red-600", colorCode: "#7c2d12" },
];

function App() {
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(true);

  const [data, setData] = useState<Data>();
  const [time, setTime] = useState<Moment>(); // time - clock
  const [clouds, setClouds] = useState<{
    number: number;
    scale: number[] | string[];
    top: number[];
    speed: number[];
  }>(); // no. of clouds to render and their props
  const [tempTextClass, setTempTextClass] = useState({
    class: "",
    colorCode: "",
  }); // Default color or some neutral color]

  // map marker custom
  const iconMarkup = renderToStaticMarkup(
    <div className="bg-transparent w-0 h-0 absolute">
      <MapPin className="" size={40} fill="red" />
    </div>
  );
  const customMarkerIcon = divIcon({
    html: iconMarkup,
  });

  // call the api
  useEffect(() => {
    (async () => {
      setLoading(true);
      // await delay(4000);
      await getWeather();
    })();
  }, []);

  // handle time, tempColor when data obj change
  useEffect(() => {
    const interval = setInterval(() => handleTime(), 1000);
    // console.log(data);

    // temp text set
    if (data?.current?.temp_c) {
      setCardLoading(true);
      for (const range of temperatureRanges) {
        if (data.current.temp_c <= range.maxTemp) {
          setTempTextClass({
            class: range.colorClass,
            colorCode: range.colorCode,
          });
          break;
        }
      }
      setCardLoading(false);
    }

    generateCloud();

    return () => clearInterval(interval);
  }, [data]);

  useEffect(() => {
    console.log(clouds);
  }, [clouds]);

  // update time fun
  function handleTime() {
    if (data?.location?.localtime && data.location.tz_id) {
      const { localtime, tz_id } = data.location;
      let time = moment(new Date()).tz(tz_id);
      // console.log(time.format("HH:mm:ss"));
      setTime(time);
    }
  }

  // generate clouds if any
  function generateCloud() {
    if (data?.current?.cloud) {
      const number_of_clouds = data.current.cloud; // no. of clouds
      let widths: number[] | string[]; // list for random widths
      let top: number[];
      let speed: number[];

      switch (true) {
        case number_of_clouds >= 0 && number_of_clouds < 20:
          widths = Array.from({ length: number_of_clouds }, () =>
            getRandomFloatInRange(1, 0.4)
          );
          top = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(2, 90)
          );
          speed = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(15, 40)
          );
          setClouds({ number: 4, scale: widths, top: top, speed });
          break;
        case number_of_clouds >= 20 && number_of_clouds < 40:
          widths = Array.from({ length: number_of_clouds }, () =>
            getRandomFloatInRange(1, 0.4)
          );
          top = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(2, 90)
          );
          speed = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(15, 40)
          );

          setClouds({ number: 8, scale: widths, speed, top: top });
          break;
        case number_of_clouds >= 40 && number_of_clouds < 60:
          widths = Array.from({ length: number_of_clouds }, () =>
            getRandomFloatInRange(1, 0.4)
          );
          top = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(2, 90)
          );
          speed = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(15, 40)
          );

          setClouds({ number: 12, scale: widths, speed, top: top });
          break;
        case number_of_clouds >= 60 && number_of_clouds < 80:
          widths = Array.from({ length: number_of_clouds }, () =>
            getRandomFloatInRange(1, 0.4)
          );
          top = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(2, 90)
          );
          speed = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(15, 40)
          );

          setClouds({ number: 15, scale: widths, speed, top: top });
          break;
        case number_of_clouds >= 80 && number_of_clouds <= 100:
          widths = Array.from({ length: number_of_clouds }, () =>
            getRandomFloatInRange(1, 0.4)
          );
          top = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(2, 90)
          );
          speed = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(15, 40)
          );

          setClouds({ number: 15, scale: widths, speed, top: top });
          break;
        default:
          widths = Array.from({ length: number_of_clouds }, () =>
            getRandomFloatInRange(40, 200)
          );
          top = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(2, 90)
          );
          speed = Array.from({ length: number_of_clouds }, () =>
            getRandomNumberInRange(15, 40)
          );

          setClouds({ number: 6, scale: widths, speed, top: top });
          break;
      }
    }
  }

  // get the api call
  const getWeather = async () => {
    axios
      .get(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&q=new-york`
      )
      .then((res) => {
        const data: Data = res.data;
        console.log(data);

        setData(data);
        setLoading(false);
      })
      .catch((e) => {
        console.log(e);
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col">
      {loading ? (
        <>
          <div
            className="animate-bounce-ball absolute left-1/2 top-1/2 h-[50px] w-[50px]
      -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400 shadow-xl"
          ></div>
          <span
            className="animate-shadow-ball absolute left-1/2 top-1/2 -z-10 h-[4px] w-[55px]
      -translate-x-1/2 translate-y-[44px] rounded-full bg-red-700 blur-[5px]"
          ></span>
        </>
      ) : (
        <>
          {/* <div
            style={{ background: tempTextClass.colorCode }}
            className="opacity-30 h-screen w-full absolute z-[555]"
          ></div> */}

          {/* cloud  */}
          {clouds?.number && clouds.speed
            ? Array.from({ length: clouds.number }, (_, i) => {
                return (
                  <div
                    style={{
                      transform: `scale(${clouds.scale[i]})`,
                      top: `${clouds.top[i]}%`,
                      animationDuration: `${clouds.speed[i]}s`,
                    }}
                    key={i}
                    className={`cloud animate-[cloud-move_30s_linear_infinite]`}
                  ></div>
                );
              })
            : null}

          <MapContainer
            style={{ width: "100%", height: "100vh" }}
            center={[
              data?.location?.lat ?? 51.505,
              data?.location?.lon ?? -0.09,
            ]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              icon={customMarkerIcon}
              position={[
                data?.location?.lat ?? 51.505,
                data?.location?.lon ?? -0.09,
              ]}
            ></Marker>
          </MapContainer>

          {cardLoading ? null : (
            <div className="absolute z-[999] p-4 sm:w-[200px] md:w-[270px] right-0">
              <div
                style={{
                  background: `linear-gradient(90deg, ${tempTextClass.colorCode} 0%, rgba(255,255,255,1) 120%)`,
                }}
                className={`text-center rounded-md shadow-lg sm:m-0 md:m-12 p-[20px] flex-col flex items-center justify-center`}
              >
                <img
                  style={{
                    borderColor: tempTextClass.colorCode,
                    borderRadius: "50%",
                  }}
                  className={`border-2 p-1 rounded-full}`}
                  src={data?.current?.condition.icon}
                  alt="temp"
                />
                <span
                  className={`font-semibold ${
                    "text-" + tempTextClass.class ?? "text-slate-700"
                  }`}
                >
                  {data?.current?.temp_c} °C{" "}
                </span>
                <span
                  className={`text-sm text-center text-${tempTextClass.class}`}
                >
                  {data?.current?.condition.text}{" "}
                </span>
                <span className="font-bold text-2xl">
                  {data?.location?.name}
                </span>
                <span className="font-semibold text-slate-800 text-md">
                  {data?.location?.country}
                </span>
                <span className="text-xs mt-2 font-semibold">
                  {time
                    ? time?.format("YYYY-MM-DD")
                    : data?.location?.localtime}
                </span>
                <span className="text-xs font-semibold">
                  {time ? time?.format("HH:mm:ss") : data?.location?.localtime}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
