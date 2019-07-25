// JavaScript Document

var model;


function resetvals(){
  model = {
	"Month_April": {"coef":-6.558072e+10, "val":0}, 
	"Month_August": {"coef":-6.197360e+10, "val":0},
 	"Month_December": {"coef":-6.215227e+10, "val":0},
 	"Month_February": {"coef":-6.106911e+10, "val":0},
 	"Month_January": {"coef":-6.372832e+10, "val":0},
 	"Month_July": {"coef":-6.179419e+10, "val":0},
 	"Month_June": {"coef":-6.268395e+10, "val":0},
 	"Month_March": {"coef":-6.233021e+10, "val":0},
 	"Month_May": {"coef":-6.320924e+10, "val":0},
 	"Month_November": {"coef":-6.458002e+10, "val":0},
 	"Month_October": {"coef":-6.424132e+10, "val":0},
 	"Month_September": {"coef":-6.355597e+10, "val":0},
	"Weekday_Friday": {"coef":-1.855442e+13, "val":0},
 	"Weekday_Monday": {"coef":-1.880553e+13, "val":0},
 	"Weekday_Saturday": {"coef":-1.835449e+13, "val":0},
 	"Weekday_Sunday": {"coef":-1.794190e+13, "val":0},
	"Weekday_Thursday": {"coef":-1.915692e+13, "val":0},
 	"Weekday_Tuesday": {"coef":-1.920984e+13, "val":0},
	"Weekday_Wednesday": {"coef":-1.910371e+13, "val":0},
 	"Police_District_Bayview": {"coef":3.010463e+12, "val":0},
 	"Police_District_Central": {"coef":3.123190e+12, "val":0},
	"Police_District_Ingleside": {"coef":3.039252e+12, "val":0},
 	"Police_District_Mission": {"coef":3.409409e+12, "val":0},
 	"Police_District_Northern": {"coef":3.150395e+12, "val":0},
 	"Police_District_Park": {"coef":2.836280e+12, "val":0},
 	"Police_District_Richmond": {"coef":2.812388e+12, "val":0},
 	"Police_District_Southern": {"coef":3.274717e+12, "val":0},
 	"Police_District_Taraval": {"coef":2.913900e+12, "val":0},
	"Police_District_Tenderloin": {"coef":3.242757e+12, "val":0},
	"Crime_Drug": {"coef":8.942472e+12, "val":0},
	"Crime_Nonviolent": {"coef":9.553079e+12, "val":0},
	"Crime_Sex": {"coef":6.588738e+12, "val":0},
 	"Crime_Violent": {"coef":9.452757e+12, "val":0},

 	"y-intercept":-0.11406177
	};
}


function getCrimesForDate(m, d){
	//January, Monday
	var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

	var day = days[d];
	var month = months[m];
	
	resetvals();
	
	//var mlist=["January","February","March","April","May","June","July","August","September","October","November","December"];
	model["Month_"+month]["val"]=1;
	model["Weekday_"+day]["val"]=1;
	
	var alldists={"Mission":{}};//{"Bayview":{},"Central":{},"Ingleside":{},"Mission":{},"Northern":{},"Park":{},"Richmond":{},"Southern":{},"Taraval":{},"Tenderloin":{}};
	for (var dist in alldists){
		alldists[dist]=getCrimesbyDistrict(dist);
	}
	return alldists;
}

function getCrimesbyDistrict(dstr){
	//Bayview
	//assumes month, weekday set
	model["Police_District_Bayview"].val = 0;
	model["Police_District_Central"].val = 0;
	model["Police_District_Ingleside"].val = 0;
	model["Police_District_Mission"].val = 0;
	model["Police_District_Northern"].val = 0;
	model["Police_District_Park"].val = 0;
	model["Police_District_Richmond"].val = 0;
	model["Police_District_Southern"].val = 0;
	model["Police_District_Taraval"].val = 0;
	model["Police_District_Tenderloin"].val = 0;
	model["Police_District_"+dstr].val = 1;
	var crimenums={"Nonviolent":0};//{"Drug":0,"Sex":0,"Violent":0,"Nonviolent":0}
	for (var key in crimenums){
		crimenums[key]=getCrimesbyType(key);
	}
	return crimenums;
}

function getCrimesbyType(str){
	//Drug
	//assumes month, weekday, district are set
	model["Crime_Drug"].val = 0;
	model["Crime_Sex"].val =0;
	model["Crime_Violent"].val =0;
	model["Crime_Nonviolent"].val =0;
	model["Crime_"+str].val =1;
	var count = calculate();
	return count;
}

function calculate(){
	var y=0;
	for (var mkey in model){
		if (mkey=="y-intercept"){
			y+=model[mkey];
		}else{
			console.log('adding '+mkey+ '= '+model[mkey]['coef']*model[mkey]['val']);
			y+=model[mkey]['coef']*model[mkey]['val'];
		}
	}
	/*
	var y = model.Month_January["coef"]*model.Month_January["val"] + model.Month_February["coef"]*model.Month_February["val"] + model.Month_March["coef"]*model.Month_March["val"] + model.Month_April["coef"]*model.Month_April["val"] + model.Month_May["coef"]*model.Month_May["val"] + model.Month_June["coef"]*model.Month_June["val"] + model.Month_July["coef"]*model.Month_July["val"] + model.Month_August["coef"]*model.Month_August["val"] + model.Month_September["coef"]*model.Month_September["val"] + model.Month_October["coef"]*model.Month_October["val"] + model.Month_November["coef"]*model.Month_November["val"] + model.Month_December["coef"]*model.Month_December["val"] + model.Weekday_Sunday["coef"]*model.Weekday_Sunday["val"] + model.Weekday_Monday["coef"]*model.Weekday_Monday["val"] + model.Weekday_Tuesday["coef"]*model.Weekday_Tuesday["val"] + model.Weekday_Wednesday["coef"]*model.Weekday_Wednesday["val"] + model.Weekday_Thursday["coef"]*model.Weekday_Thursday["val"] + model.Weekday_Friday["coef"]*model.Weekday_Friday["val"] + model.Weekday_Saturday["coef"]*model.Weekday_Saturday["val"] + model.Police_District_Bayview["coef"]*model.Police_District_Bayview["val"] + model.Police_District_Central["coef"]*model.Police_District_Central["val"] + model.Police_District_Ingleside["coef"]*model.Police_District_Ingleside["val"] + model.Police_District_Mission["coef"]*model.Police_District_Mission["val"] + model.Police_District_Northern["coef"]*model.Police_District_Northern["val"] + model.Police_District_Park["coef"]*model.Police_District_Park["val"] + model.Police_District_Richmond["coef"]*model.Police_District_Richmond["val"] + model.Police_District_Southern["coef"]*model.Police_District_Southern["val"] + model.Police_District_Taraval["coef"]*model.Police_District_Taraval["val"] + model.Police_District_Tenderloin["coef"]*model.Police_District_Tenderloin["val"] + model.Crime_Drug["coef"]*model.Crime_Drug["val"] + model.Crime_Nonviolent["coef"]*model.Crime_Nonviolent["val"] + model.Crime_Sex["coef"]*model.Crime_Sex["val"] + model.Crime_Violent["coef"]*model.Crime_Violent["val"] + model["y-intercept"];
	*/
	return y;
}









