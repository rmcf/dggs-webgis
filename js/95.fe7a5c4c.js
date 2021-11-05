"use strict";(self["webpackChunkdggs_webgis"]=self["webpackChunkdggs_webgis"]||[]).push([[95],{6095:(e,t,r)=>{r.r(t),r.d(t,{default:()=>W});var a=r(3673);function o(e,t,r,o,s,n){const l=(0,a.up)("Map"),i=(0,a.up)("q-page");return(0,a.wg)(),(0,a.j4)(i,{class:"q-pt-lg"},{default:(0,a.w5)((()=>[(0,a._)("div",null,[(0,a.Wm)(l)])])),_:1})}var s=r(2323);const n=e=>((0,a.dD)("data-v-4c59d526"),e=e(),(0,a.Cn)(),e),l={class:"q-pl-md q-pr-md q-pb-md"},i={class:"row justify-between items-center"},p=n((()=>(0,a._)("sup",null,"2",-1))),c={style:{"padding-right":"100px"}},u={style:{height:"20px",position:"relative"}},m={id:"openmap",ref:"map-gis",class:"map-container"};function d(e,t,r,o,n,d){const h=(0,a.up)("q-spinner-ios"),f=(0,a.up)("q-inner-loading");return(0,a.wg)(),(0,a.iD)("div",l,[(0,a._)("div",i,[(0,a._)("div",null,"Map zoom: "+(0,s.zw)(n.mapZoom),1),(0,a._)("div",null,[(0,a.Uk)("Map area: "+(0,s.zw)(d.mapAreaComputedFormated)+" km",1),p]),(0,a._)("div",null," Hexagons quantity: "+(0,s.zw)(n.featuresQuantity)+" at Level: "+(0,s.zw)(n.layerLevel),1),(0,a._)("div",c,[(0,a._)("div",u,[(0,a.Wm)(f,{showing:n.loading},{default:(0,a.w5)((()=>[(0,a.Wm)(h,{color:"primary",size:"20px"})])),_:1},8,["showing"])])])]),(0,a._)("div",m,null,512)])}r(71),r(7098),r(5363),r(2167);var h=r(921),f=r.n(h),g=r(3081),y=r(5140),w=r(7879),Z=r(2411),C=r(3212),v=r(7263),S=r(5344),x=r(9109),b=r(807),P=r(5149),E=r(9821),_=r(5773),M=r(3489),A=r(5090),G=r(9455),L=r(1314),R=r(7434),k=r.n(R);r(4529);const T=new M.ZP({fill:new A.Z({color:"rgba(255, 255, 255, 0.6)"}),stroke:new G.Z({color:"#319FD3",width:1}),text:new L.Z({font:"12px Calibri,sans-serif",fill:new A.Z({color:"#000"}),stroke:new G.Z({color:"#fff",width:3})})}),$=new M.ZP({fill:new A.Z({color:"#fff"}),stroke:new G.Z({color:"#319FD3",width:1}),text:new L.Z({font:"12px Calibri,sans-serif",fill:new A.Z({color:"#000"}),stroke:new G.Z({color:"#fff",width:3})})}),F=new M.ZP({fill:new A.Z({color:"#0000ff"}),stroke:new G.Z({color:"transparent",width:0}),text:new L.Z({font:"8px Calibri,sans-serif",fill:new A.Z({color:"#000"}),stroke:new G.Z({color:"#fff",width:3})})}),V={name:"Map",components:{},data(){return{map:null,mapCenter:[2791191.1823448315,8117240.098736058],mapZoom:6,mapExtent:[],mapArea:null,layers:[],dggsLayersFeatures:[],featuresQuantity:0,layerLevel:0,corners:null,loading:!1}},watch:{layerSelectedRasterComputed(e,t){this.createMap()},layersSelectedVectorComputed(e,t){this.createMap()},layerSelectedDGGSComputed(e,t){this.createMap()},mapZoom(e,t){this.$store.commit("layers/SET_MAP_ZOOM",this.mapZoom),this.$store.commit("layers/MAP_AREA",this.mapAreaComputed)}},mounted(){this.createMap()},methods:{async createMap(){this.loading=!0,this.map=null;var e=this;document.getElementById("openmap").innerHTML="",this.map=new g.Z({target:this.$refs["map-gis"],layers:[],view:new y.ZP({center:this.mapCenter,zoom:this.mapZoom,constrainResolution:!0})});const t=new w.Z({name:"osm",type:"raster",source:new Z.Z({url:this.layerSelectedRasterComputed.url,attributions:this.layerSelectedRasterComputed.attributions})});e.map.addLayer(t),this.layersSelectedVectorComputed.length>0&&this.layersSelectedVectorComputed.forEach((t=>{let r=new v.Z({source:new S.Z({url:t.url,format:new x.Z}),style:function(e){return T.getText().setText(e.get("name")),T}});console.log("1 vector layer"),e.map.addLayer(r)}));var r=[];if(this.layerSelectedDGGSComputed.length>0){var a=this.layerSelectedDGGSComputed,o=this.mapExtent.toString();await Promise.all(a.map((async t=>{var a=[];try{a=await this.$axios.get("https://dggs-api-bozea3cspa-ew.a.run.app/dggs-api/collections/"+t.id+"/zones",{params:{resolution:t.level,limit:1e4,bbox:o},headers:{"Content-Type":"application/json"}})}catch(Z){this.loading=!1,console.log("error ",Z.message)}let s=a.data.features;var n=[],l=[];s.forEach((e=>{let r=f().h3ToFeature(e.id);Object.entries(e.properties).forEach((e=>{const[t,a]=e;r.properties[t]=a})),n.push(r),l.push(e.properties[t.choroplethParameter])}));var i=[""];s.length>0&&Object.entries(s[0].properties).forEach((e=>{const[t,r]=e;i.push(t)}));var p=l.sort(),c=p.filter((function(e){return e>0})),u=k().limits(c,t.choroplethRangesMode,t.choroplethRanges),m=k().scale(t.choroplethColorPalette).classes(u);this.featuresQuantity=n.length,this.layerLevel=t.level;let d=[];u.forEach((e=>{let t={color:"",value:0},r=m(e).hex();t.color=r,t.value=e,d.push(t)}));let h={type:"FeatureCollection",features:n};const g=new S.Z({features:(new x.Z).readFeatures(h,{featureProjection:"EPSG:3857"})}),y=new v.Z({name:t.id,type:"vector",source:g,renderer:"canvas",style:function(e){if(""!==t.choroplethParameter){if(t.choroplethLabels){let r=null,a=e.get(t.choroplethParameter);r=a?a.toFixed(2):a,F.getText().setText(r+"")}else F.getText().setText("");let r=m(e.get(t.choroplethParameter)).hex();return F.getFill().setColor(r),F}return $},opacity:t.opacity});e.map.addLayer(y);let w={layerID:t.id,choroplethParameters:i,choroplethLegend:d};r.push(w)})))}this.layersChoroplethProperties(r),this.map.on("moveend",(e=>{let t=e.map;this.mapCenter=t.getView().getCenter(),this.mapZoom=t.getView().getZoom();let r=t.getView().calculateExtent(),a=(0,C.$A)(r,"EPSG:3857","EPSG:4326");this.mapExtent=a})),this.loading=!1},numberWithSpaces(e){var t=e.toString().split(".");return t[0]=t[0].replace(/\B(?=(\d{3})+(?!\d))/g," "),t.join(".")},layersChoroplethProperties(e){this.$store.commit("layers/LAYER_CHOROPLETH_PARAMETERS",e)}},computed:{mapCenterComputed:function(){let e=this.mapCenter,t=(0,C.bU)(e);return t},mapAreaComputed:function(){if(this.map&&this.mapZoom){let a=this.map.getView().calculateExtent(),o=(0,_.hC)(a),s=(0,_.w$)(a),n=(0,_.rL)(a),l=(0,_.Xv)(a),i=[];i.push(o,n,l,s,o);var e=new b.Z({geometry:new P.ZP([i]),name:"polygon"}),t=e.getGeometry(),r=(0,E.bg)(t)/1e6;return r}return null},mapAreaComputedFormated:function(){if(this.mapAreaComputed){let e=this.mapAreaComputed,t=e.toFixed(2);return this.numberWithSpaces(t)}return null},layersSelectedVectorComputed:function(){return this.$store.state.layers.layersSelectedVector},layerSelectedRasterComputed:function(){return this.$store.state.layers.layerSelectedRaster},layerSelectedDGGSComputed:function(){return this.$store.state.layers.layersSelectedDGGS}}};var D=r(6941),z=r(8506),q=r(7518),j=r.n(q);V.render=d,V.__scopeId="data-v-4c59d526";const I=V;j()(V,"components",{QInnerLoading:D.Z,QSpinnerIos:z.Z});const O={name:"Web-GIS",components:{Map:I},data(){return{}},mounted(){},methods:{},computed:{layersSelectedVectorComputed:function(){return this.$store.state.layers.layersSelectedVector},layerSelectedRasterComputed:function(){return this.$store.state.layers.layerSelectedRaster}}};var Q=r(4379);O.render=o;const W=O;j()(O,"components",{QPage:Q.Z})}}]);