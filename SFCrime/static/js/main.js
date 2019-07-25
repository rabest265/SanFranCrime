var myMap = L.map("map", {
  	center: [37.7749, -122.4294],
  	zoom: 13,
	zoomControl: false
});


//add zoom control with your options
L.control.zoom({
     position:'topright'
}).addTo(myMap);

var mainmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap);

var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var heat, dots;
var geodist, geohood;
var mshow='pdist';
var mydatepicker;
var future=false;

$( document ).ready(function() {
	//$( "#datepicker" ).datepicker({"setDate", "1/1/2019");
    var qstr="$limit=10000";
	//var qstr="incident_year=2018&$limit=10000&$where=UPPER(incident_category) like '%25THEFT%25' OR UPPER(incident_category) like '%25ARSON%25' OR UPPER(incident_category) like '%25RAPE%25'";
	
	var date = new Date();
	date.setDate(date.getDate() - 2);
	
	var qstr="$limit=100000&incident_date=2018-01-01T00:00:00.000&";
	var qstr="$limit=100000&incident_date="+incfromdate(date);//2019-07-22T00:00:00.000";
	/*for (var c=0; c<catl.length; c++){
		if (c==0) qstr+="$where=";
		qstr+="UPPER(incident_category) like '%25"+catl[c]+"%25'";
		if (c<catl.length-1) qstr+=' OR ';
	}
	*/
	showmapping(qstr);
	
	$('input[type="radio"]').on('change', function(e) {
		mshow = $(this).val();
		handleVis();
	});
	 /*$('#datepicker').datepicker({
            //uiLibrary: 'bootstrap4'
      });*/
	
	var yest=datetostring(date);
	mydatepicker = $('#datepicker').datepicker({
		value: yest
	});
	$('#datepicker, .inctype').on('change', convertDateAndShow);
	$('#sideham').on('click', function () {
         $('#sidebar').toggleClass('active');
    });
});


function incfromdate(dateObj){
	var dstr = dateObj.toISOString();
	ndstr=dstr.split("T")[0]+"T00:00:00.000";
	return ndstr;
}

function convertDateAndShow(){
	var myval=mydatepicker.value();
	var ndate=new Date(myval);
	var nowdate = new Date();
	nowdate.setDate(nowdate.getDate() - 2);
	var ndatestr=incfromdate(ndate);
	var nowdatestr=incfromdate(nowdate);
	var nflag=undefined;
	if (ndatestr>nowdatestr){
		ndate.setFullYear(2018);
		nflag=1;
		future=true;
	}else future=false;
	var ndatestr=datetostring(ndate);
	resetMap();
	var qstr="$limit=100000&incident_date="+incfromdate(ndate);
	showmapping(qstr, nflag);
}

function datetostring(dateObj){
	var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	console.log(dateObj.toISOString());
	return(dateObj.toLocaleDateString("en-US")); // 9/17/2016
}

function showmapping(qstr, nflag){
	
	var url = "https://data.sfgov.org/resource/wg3w-h783.json?"+qstr;//"$limit=10000";//?$where=UPPER(incident_category) like '%25ASSAULT%25'";//$limit=10000";
	console.log('url= '+url);
	
	d3.json(url, function(response) {
		
		//chloropleths
  		var pdistricts={};
		var nhoods={};
		var heatArray=[];
		var rlen=response.length;
		
		
		
		
		if (rlen<1)return;
		
		var myRenderer = L.canvas({ padding: 0.5 });
		
		var vtotal=0;
		var nonvtotal=0;
		var dtotal=0;
		var stotal=0;
		function findCat(acat,alist){
			if (acat==undefined || acat=="") return "";
			else acat=acat.toUpperCase();
			if (alist==undefined || alist==[]) alist=["violent","nonviolent","drug","sex"];
			var catviolent=["ARSON", "ASSAULT", "KIDNAPPING", "ROBBERY", "SEX OFFENSES, FORCIBLE", "HOMICIDE"];
			var catnonviolent=["BURGLARY", "LARCENY","THEFT","STOLEN PROPERTY","FRAUD","EMBEZZLEMENT","AGAINST THE FAMILY","MISCHIEF","DISORDERLY CONDUCT","WEAPONS","TRAFFIC VIOLATION ARREST"];
			var catdrug=["DRUG","NARCOTIC"];
			var catsex=["SEX OFFENSE",  "PROSTITUTION",  "PORNOGRAPHY","OBSCENE MAT", "RAPE"];
			var ans="";
			for (var v=0; v<catviolent.length; v++){
				if (acat.includes(catviolent[v])){
					vtotal=1;
					if (alist.indexOf("violent")>-1) return "Violent";
				}
			}
			
			for (var v=0; v<catnonviolent.length; v++){
				if (acat.includes(catnonviolent[v])){
					nonvtotal+=1;
					if (alist.indexOf("nonviolent")>-1) return "Nonviolent";
				}
			}
			
			for (var v=0; v<catdrug.length; v++){
				if (acat.includes(catdrug[v])){
					dtotal+=1;
					if (alist.indexOf("drug")>-1) return "Drug";
				}
			}
			
			
			for (var v=0; v<catsex.length; v++){
				if (acat.includes(catsex[v])){
					stotal+=1;
					if (alist.indexOf("sex")>-1) return "Sex";
				} 
			}
			
			return ans;
		}
		
		function getColor(acat){
			if (acat=="Violent") return "#fd0202";//"#ba000d";//
			else if (acat=="Nonviolent") return "#729c2f";//"#a3612f";//"#fe7643";//
			else if (acat=="Drug") return "#036de5";
			else if (acat=="Sex") return "#c203e5";
		}

		//"Southern":{"total":0, "Other Miscellaneous""8}
		dots=[];
		var vn=0;
  		for (var i = 0; i < rlen; i++) {
    		var pdist = response[i]["police_district"].toUpperCase();
			var icat=response[i]["incident_category"];
			var nh = response[i]["analysis_neighborhood"];
			
			
			
			var alist=[];
			$('input.inctype').each(function(i,el){
				var el=$(el);
				if(el.is(':checked')) alist.push(el.attr('id'));
			});
			//console.log('alist='+alist);
			var mycat = findCat(icat,alist);
			if (mycat=="") {
				//console.log(icat);
				continue;
			}
			vn++;
			if (pdistricts.hasOwnProperty(pdist)){
				pdistricts[pdist]['All']=pdistricts[pdist]['All']+1;
				if (pdistricts[pdist].hasOwnProperty(icat)){
					pdistricts[pdist][icat]=pdistricts[pdist][icat]+1;
				}else{
					pdistricts[pdist][icat]=1;
				}
			}else{
				pdistricts[pdist]={"All":1};
				pdistricts[pdist][icat]=1;
			}
			
			if (nhoods.hasOwnProperty(nh)){
				nhoods[nh]['All']=nhoods[nh]['All']+1;
				if (nhoods[nh].hasOwnProperty(icat)){
					nhoods[nh][icat]=nhoods[nh][icat]+1;
				}else{
					nhoods[nh][icat]=1;
				}
			}else if (nh!=="" && nh!==undefined){
				nhoods[nh]={"All":1};
				nhoods[nh][icat]=1;
			}
			
			var point = response[i].point;
			if (point) {
      			heatArray.push([point.latitude, point.longitude]);
				dots.push(L.circleMarker([point.latitude, point.longitude], {
  					renderer: myRenderer,
					radius:6,
					fillColor: getColor(mycat),
					weight:0,
					fillOpacity:1
  				}).bindPopup('Time: ' + response[i]["incident_time"] + "<br>"+response[i]["incident_description"]));
    		}
			
  		}
		console.log("original total = "+rlen);
		console.log("actual total = "+vn);
		var mdiv=$('#sidemsg');
		var mdstr=""
		if (nflag!=undefined){
			mdstr+="<h4>Predicted</h4>";
		}else{
			mdstr+="<h4>Summary</h4>";
		}
		vn=vtotal+nonvtotal+dtotal+stotal;
		mdstr+="<p>Total Incidents: "+vn+"<br>";
		mdstr+="Violent: "+vtotal+"<br>";
		mdstr+="Noniolent: "+nonvtotal+"<br>";
		mdstr+="Drug: "+dtotal+"<br>";
		mdstr+="Sex: "+stotal+"<br>";
		mdiv.html(mdstr);
		/*var flen=policegeo.features.length;
		for (var f=0; f<flen; f++){
			var myf= policegeo.features[f];
			var mydist = myf.properties.district;
			var n=0;
			if (pdistricts.hasOwnProperty(mydist)){
				for (cat in pdistricts[mydist]){
					myf.properties[cat]=pdistricts[mydist][cat];
					n+=pdistricts[mydist][cat];
				}
			}
			console.log(mydist+": "+n)
			policegeo.features[f]=myf;
		}*/
		var myscale = ["#ffffb2", "#b10026"];
		if (nflag!=undefined) myscale = ["#a2facb", "#2c5a84"];
		
		geodist = L.choropleth(policegeo, {
			valueProperty: function (feature) {
					var pd= feature.properties.district;
					if (pdistricts.hasOwnProperty(pd)){
						return pdistricts[pd]["All"];
					}else{
						return 0;
					}
    		},//"All",

    		// Set color scale
    		scale: myscale,

    		// Number of breaks in step range
    		steps: 10,

    		// q for quartile, e for equidistant, k for k-means
    		mode: "k",
    		style: {
      			// Border color
      			color: "#fff",
				weight: 1,
      			fillOpacity: 0.7
    		},

    		// Binding a pop-up to each layer
			onEachFeature: function(feature, layer) {
				var sstr="";
				/*for (prop in feature.properties){
					if (prop!=='nhood' && prop!=='All' && (prop.indexOf('shape')==-1 && prop!=='district' && prop!=='company')){
						sstr+=prop+": "+feature.properties[prop]+"<br>";
					}
				}*/
				var inum=0;
				if (pdistricts.hasOwnProperty(feature.properties.district)){
					if (nflag==undefined){
					for (prop in pdistricts[feature.properties.district]){
						if (prop!=='All'){
							sstr+=prop+": "+pdistricts[feature.properties.district][prop]+"<br>";
						}
					}
					}
					inum=pdistricts[feature.properties.district]["All"];
				}
      			layer.bindPopup("<h3>"+feature.properties.district+"</h3><strong>Total Number of Incidents: " + inum +"</strong><br>"+sstr);
    		}
  		});//.addTo(myMap);
		
		
		//	
		/*var flen=nhoodgeo.features.length;
		for (var f=0; f<flen; f++){
			var myf= nhoodgeo.features[f];
			var mydist = myf.properties.nhood;
			if (nhoods.hasOwnProperty(mydist)){
				for (cat in nhoods[mydist]) myf.properties[cat]=nhoods[mydist][cat];
			}
			nhoodgeo.features[f]=myf;
		}*/
		
		geohood = L.choropleth(nhoodgeo, {

    		// Define what  property in the features to use
    		valueProperty: function (feature) {
					var mynh= feature.properties.nhood;
					if (nhoods.hasOwnProperty(mynh)){
						return nhoods[mynh]["All"];
					}else{
						return 0;
					}
    		},//"All",

    		// Set color scale
    		scale: myscale,

    		// Number of breaks in step range
    		steps: 10,

    		// q for quartile, e for equidistant, k for k-means
    		mode: "k",
    		style: {
      			// Border color
      			color: "#fff",
				weight: 1,
      			fillOpacity: 0.7
    		},
			
    		// Binding a pop-up to each layer
			onEachFeature: function(feature, layer) {
				var sstr="";
				/*for (prop in feature.properties){
					if (prop!=='nhood' && prop!=='All'){
						sstr+=prop+": "+feature.properties[prop]+"<br>";
					}
				}*/
				
				var inum=0;
				if (nhoods.hasOwnProperty(feature.properties.nhood)){
					if (nflag==undefined){
					for (prop in nhoods[feature.properties.nhood]){
						if (prop!=='All'){
							sstr+=prop+": "+nhoods[feature.properties.nhood][prop]+"<br>";
						}
					}
					}
					inum=nhoods[feature.properties.nhood]["All"];//feature.properties.All;
				}
      			layer.bindPopup("<h3>"+feature.properties.nhood+"</h3><strong>Total Number of Incidents: " + inum +"</strong><br>"+sstr);
    		}
  		});
		
		
			
		
		
  		//console.log('heatArray.length = '+heatArray.length);
  		heat = L.heatLayer(heatArray, {
    		radius: 40,//20,
    		blur: 70//35
  		});
		
		if(nflag!=undefined){
			if (mshow=='hmap') {
				mshow='pdist';
			}else if (mshow=='inci'){
				mshow='hood';
			}
		}
		handleVis();
		
	});
	
}

function handleVis(){
	if (geodist==undefined) return;
	if (mshow=="pdist"){
		mainmap.addTo(myMap);
		myMap.removeLayer(positron);
		geodist.addTo(myMap);
		myMap.removeLayer(geohood);
		myMap.removeLayer(heat);
		var dlen=dots.length;
		for(var i=0; i<dlen; i++) myMap.removeLayer(dots[i]);
		
	}else if (mshow=='hood'){
		mainmap.addTo(myMap);
		myMap.removeLayer(positron);
		geohood.addTo(myMap);
		myMap.removeLayer(geodist);
		myMap.removeLayer(heat);
		var dlen=dots.length;
		for(var i=0; i<dlen; i++) myMap.removeLayer(dots[i]);
	}else if (mshow=='hmap'){
		if (future)return;
		var dlen=dots.length;
		for(var i=0; i<dlen; i++) myMap.removeLayer(dots[i]);
		mainmap.addTo(myMap);
		myMap.removeLayer(positron);
		heat.addTo(myMap);
		myMap.removeLayer(geodist);
		myMap.removeLayer(geohood);	
	}else{
		if (future)return;
		positron.addTo(myMap);
		myMap.removeLayer(mainmap);
		var dlen=dots.length;
		for(var i=0; i<dlen; i++) dots[i].addTo(myMap);
		myMap.removeLayer(geodist);
		myMap.removeLayer(geohood);	
		myMap.removeLayer(heat);	
	}
}

function resetMap(){
	myMap.removeLayer(geodist);
	myMap.removeLayer(geohood);
	myMap.removeLayer(heat);
	var dlen=dots.length;
	for(var i=0; i<dlen; i++) myMap.removeLayer(dots[i]);
	dots=[];
	geohood=undefined;
	geodist=undefined;
	heat=undefined;
}

function showheat(heatArray){
	console.log('heat is '+heat);
	if (heat==undefined){
		heat = L.heatLayer(heatArray, {
    		radius: 20,
    		blur: 35
  		});
		heat.addTo(myMap);
		console.log('-------end initmap ');
	}else{
		console.log('showheat array len= '+heatArray.length);
		heat.setLatLngs(heatArray);
		console.log('-------end update ');
	}
}

function getheat(qstr){
	//var url = "https://data.sfgov.org/resource/cuks-n6tp.json?$limit=10000";
	var url = "https://data.sfgov.org/resource/wg3w-h783.json?"+qstr;//"$limit=10000";//?$where=UPPER(incident_category) like '%25ASSAULT%25'";//$limit=10000";
	console.log('url= '+url);
	var hdata = d3.json(url, function(response) {

  

  		var heatArray = [];

  		for (var i = 0; i < response.length; i++) {
    		/*var location = response[i].location;

    		if (location) {
      			heatArray.push([location.coordinates[1], location.coordinates[0]]);
    		}*/
	  
			var point = response[i].point;

    		if (point) {
      			heatArray.push([point.latitude, point.longitude]);
	  			//console.log (i+": "+point.longitude+", "+point.latitude);
    		}
  		}
		console.log('heatArray len= '+heatArray.length);
		showheat(heatArray);
		
  		/*console.log('heatArray.length = '+heatArray.length);
  		var heat = L.heatLayer(heatArray, {
    		radius: 20,
    		blur: 35
  		});//.addTo(myMap);
		heat.addTo(myMap);
		return heat;*/
	});
}
