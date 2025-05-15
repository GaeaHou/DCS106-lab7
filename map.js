// Import Mapbox as an ESM module
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
// Check that Mapbox GL JS is loaded
console.log('Mapbox GL JS Loaded:', mapboxgl);

// Set your Mapbox access token here
mapboxgl.accessToken = 'pk.eyJ1IjoieHVlYmluZ2hvdSIsImEiOiJjbWFwc3R3MWUwMjZiMmtwdTB5aHo3ZTRuIn0.ZwQ__2f1lbEcGQQTlaVzWg';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map', // ID of the div where the map will render
  style: 'mapbox://styles/mapbox/streets-v12', // Map style
  center: [-71.09415, 42.36027], // [longitude, latitude]
  zoom: 12, // Initial zoom level
  minZoom: 5, // Minimum allowed zoom
  maxZoom: 18, // Maximum allowed zoom
});

const bikeLaneStyle = {
    'line-color': '#32D400',
    'line-width': 5,
    'line-opacity': 0.6,
  };
  
  map.on('load', async () => {
    // 添加 Boston 自行车道数据源
    map.addSource('boston_route', {
      type: 'geojson',
      data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
    });
  
    // 添加 Boston 图层
    map.addLayer({
      id: 'boston-bike-lanes',
      type: 'line',
      source: 'boston_route',
      paint: bikeLaneStyle,  // 👈 复用样式
    });
  
    // 添加 Cambridge 自行车道数据源
    map.addSource('cambridge_route', {
      type: 'geojson',
      data: 'https://data.cambridgema.gov/api/geospatial/xyz123?method=export&format=GeoJSON', // 假设的链接
    });
  
    // 添加 Cambridge 图层
    map.addLayer({
      id: 'cambridge-bike-lanes',
      type: 'line',
      source: 'cambridge_route',
      paint: bikeLaneStyle,  // 👈 复用样式
    });

    let jsonData;
    const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
    try {
        jsonData = await d3.json(jsonurl);
        const stations = jsonData.data.stations;
        console.log('Stations:', stations);
    
        // 获取 SVG 元素
        const svg = d3.select('#map').select('svg');
    
        // 添加圆形标记
        svg.selectAll('circle')
          .data(stations)
          .enter()
          .append('circle')
          .attr('r', 5)
          .attr('fill', 'red')
          .attr('opacity', 0.7);
    
        // 更新圆的位置（每次地图视角变化都需要更新）
        function updatePositions() {
          svg.selectAll('circle')
            .attr('cx', d => map.project([+d.Long, +d.Lat]).x)
            .attr('cy', d => map.project([+d.Long, +d.Lat]).y);
        }
    
        // 初次渲染
        updatePositions();
    
        // 当地图移动或缩放时更新位置
        map.on('move', updatePositions);
        map.on('zoom', updatePositions);
        map.on('resize', updatePositions);
    
      } catch (error) {
        console.error('Error loading Bluebikes data:', error);
      }
  });