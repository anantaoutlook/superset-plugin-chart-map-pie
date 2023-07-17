/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useEffect, createRef} from 'react';
import { styled } from '@superset-ui/core';
import { SupersetPluginChartMapPieProps, SupersetPluginChartMapPieStylesProps } from './types';
const d3 = require('d3');
import usa from "./plugin/usa.json";
import countries, { countryOptions } from './plugin/countries';
import coordinates from './US_lat_long.js'

// {<script src="https://d3js.org/d3.v4.min.js"></script>}
// 	{<script src="https://d3js.org/topojson.v1.min.js"></script>}

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts



/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */


export default function SupersetPluginChartMapPie(props: SupersetPluginChartMapPieProps) {

  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { data, height, width, country } = props;

  const Styles = styled.div<SupersetPluginChartMapPieStylesProps>`
  // grid color
  .grid .tick {
    stroke: lightgrey;
    // opacity: 0.3;
    shape-rendering: crispEdges;
  }
  .grid path {
    stroke-width: 0;
  }

  #tag {
    color: #000;
    background: #fa283d;
    width: 150px;
    position: absolute;
    display: none;
    padding: 3px 6px;
    margin-left: -80px;
    font-size: 11px;
  }

  #tag:before {
    border: solid transparent;
    content: " ";
    height: 0;
    left: 50%;
    margin-left: -5px;
    position: absolute;
    width: 0;
    border-width: 10px;
    border-bottom-color: #fa283d;
    top: -20px;
  }
`;

  const rootElem = createRef<HTMLDivElement>();

  // Often, you just want to get a hold of the DOM and go nuts.
  // Here, you can do that with createRef, and the useEffect hook.

  useEffect(() => {
    // const root = rootElem.current as HTMLElement;
    // console.log('Plugin element', root);

    d3.select(".parent-svg").remove();
    drawMap();
    
  },[height,width]);

 //my code starts

 const drawMap =() =>{

      let legend_array = [];

      for (const [key, value] of Object.entries(data[0])) {

      if(key == 'state_code' || key == 'count')
      {

      }
      else{
      legend_array.push(key);
      }


      }

      var radius = 15;

      const {features} = usa;

      var svg = d3.select(".container").append("svg")
      .attr("class", "parent-svg")
      .attr("width", width)
      .attr("height",height);


      var map = svg.append("g");          // background
      var pie_points = svg.append("g");   // pie charts


      //Projection variables
     // var scale = 800;

      var projection = d3.geoMercator().fitSize([width, height], usa);
      

      var path = d3.geoPath().projection(projection);

      //Pie chart variables:
      
      var arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

      var pie = d3.pie()
      .value(function(d) { return d; });

      var color = d3.schemeCategory10;


    if(usa)
    {

    map.selectAll('path')
    .data(features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('class', 'region')
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .attr('stroke-width', '1');

    var points = pie_points.selectAll("g")
		.data(data)
		.enter()
		.append("g")
		.attr("transform",function(d) { 

      let c = coordinates.filter(function(cod){

        console.log(height);
        console.log(width);
      
        return cod.state == d.state_code;
   })
     
      if(c)
      {
        return "translate("+projection([c[0].longitude, c[0].latitude])+")" 
      }
      else{

      }
     
    })
		.attr("id", function (d,i) { return "chart"+i; })
		.append("g").attr("class","pies");
    
    }

    const RAD =[];

    var pies = points.selectAll(".pies")
		.data(function(d) {
      // radius = d.coal+d.gas+d.wind+d.solar;
      // RAD.push(radius)

      let data_array = [];

      for (const [key, value] of Object.entries(d)) {
     
       if(key == 'state_code' || key == 'count')
       {
     
       }
       else{
         data_array.push(value);
       }
       
      
     }


    return pie(data_array); })
		.enter()
		.append('g')
		.attr('class','arc')

    pies.append('path')
    .attr('d', arc)
    .attr("fill",function(d,i){
      return color[i+1];     
    });



      // Adding Legends
      var Legends = svg.selectAll('.legend')
      .data(pie(legend_array))      
      .enter().append("g")
      .attr("transform", function(d,i){
      return "translate(" + (width-((width/8))) + "," + (i * 15 + (3*height/6)) + ")"; // place each legend on the right and bump each one down 15 pixels
      })
      .attr("class", "legend");  



      Legends.append("rect") // make a matching color rectangle
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", function(d, i) {
      return color[i+1];
      });


      Legends.append("text")
      .text(function(d){
        return d.data;
      })
      .style("font-size", 14)
      .attr("y", 10)
      .attr("x", 15);
    
    }

 //my code ends

  return (

    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
       <div className="container">

       </div>

    </Styles>    
     
  );
}

{/* <h3>Hi There!!</h3>
<pre>${JSON.stringify(data, null, 2)}</pre> */}