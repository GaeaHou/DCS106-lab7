// map.js

// 导入 Mapbox 和 D3
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

console.log('Mapbox GL JS Loaded:', mapboxgl);

// 设置 Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FtbGF1OTUiLCJhIjoiY2xzOXZ2NTdqMGFwaDJqcDZ2eDQ0b2w0eSJ9.emlu4JkbjlBBE9bEay1_8A';

// 初始化地图
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-71.09415, 42.36027],
  zoom: 12,
  minZoom: 5,
  maxZoom: 18,
});

// 样式对象，供两个图层公用
const bikeLaneStyle = {
  'line-color': '#32D400',
  'line-width': 4,
  'line-opacity': 0.6,
};

function getCoords(station) {
    const point = new mapboxgl.LngLat(+station.lon, +station.lat); // Convert lon/lat to Mapbox LngLat
    const { x, y } = map.project(point); // Project to pixel coordinates
    return { cx: x, cy: y }; // Return as object for use in SVG attributes
  }

// 地图加载完成后运行
map.on('load', async () => {
  // 加载波士顿自行车道
  map.addSource('boston_route', {
    type: 'geojson',
    data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
  });
  map.addLayer({
    id: 'bike-lanes-boston',
    type: 'line',
    source: 'boston_route',
    paint: bikeLaneStyle,
  });

  // 加载剑桥自行车道
  map.addSource('cambridge_route', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson',
  });
  map.addLayer({
    id: 'bike-lanes-cambridge',
    type: 'line',
    source: 'cambridge_route',
    paint: bikeLaneStyle,
  });

  // 加载 Bluebikes 站点信息
  const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
  try {
    const jsonData = await d3.json(jsonurl);
    const stations = jsonData.data.stations;
    console.log('Stations loaded:', stations);

    // D3 绑定 SVG 层绘制站点标记
    const svg = d3.select('#map svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('position', 'absolute')
      .style('z-index', 1)
      .style('pointer-events', 'none');

    const projection = ([lon, lat]) => map.project(new mapboxgl.LngLat(lon, lat));

    const circles = svg
    .selectAll('circle')
    .data(stations)
    .enter()
    .append('circle')
    .attr('r', 5) // Radius of the circle
    .attr('fill', 'steelblue') // Circle fill color
    .attr('stroke', 'white') // Circle border color
    .attr('stroke-width', 1) // Circle border thickness
    .attr('opacity', 0.8); // Circle opacity

    // 每次地图移动时更新 SVG circle 的位置
    map.on('move', () => {
      svg.selectAll('circle')
        .attr('cx', d => projection([+d.Long, +d.Lat]).x)
        .attr('cy', d => projection([+d.Long, +d.Lat]).y);
    });

  } catch (error) {
    console.error('Error loading station JSON:', error);
  }
});