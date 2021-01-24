import { Component, OnInit } from '@angular/core';
import {AdminServiceService} from "../admin-service.service";
import {HttpErrorResponse} from "@angular/common/http";
import {User} from "../User";

declare const L: any;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})

export class UserComponent implements OnInit {

  public mymap: any;
  public title = 'Covorsicht';
  private userNotification;
  public ifClicked = false;


  public userNameToBeAdded = "";
  public useremergencyType = "";
  public useremergencySeverity = "";
  public uservictimHealthStatus = "";

  public latitude;
  public longitude;
  public resucerName;

  public userArray: any = [];
  private markersLayer;

  user: User = {
    userName: "",
    latitude: "",
    longitude: "",
    emergencyType: "",
    emergencySeverity: "",
    victimHealthStatus: ""

  };


  constructor(private adminService: AdminServiceService) {
    this.markersLayer = new L.layerGroup();
  }

public changeSelectionOverviewExample(value){
  this.useremergencyType = value
}

  public changeSelectionSeverity(value){
    this.useremergencySeverity = value
  }

  public changeSelectionStatus(value){
    this.uservictimHealthStatus = value
  }

  foods: any[] = [
    {value: 'earthquake', viewValue: 'Earthquakes'},
    {value: 'floods', viewValue: 'Floods'},
    {value: 'cyclone', viewValue: 'Cyclone'},
    {value: 'others', viewValue: 'Others'}
  ];



  items: any[] = [
    {value: 'critical', viewValue: 'Critical'},
    {value: 'high', viewValue: 'High'},
    {value: 'moderate', viewValue: 'Moderate'},
    {value: 'low', viewValue: 'Low'}
  ];

  products: any[] = [
    {value: 'severe', viewValue: 'Severe'},
    {value: 'fatigue', viewValue: 'Fatigue'},
    {value: 'normal', viewValue: 'Normal'},
    {value: 'good', viewValue: 'Good'}
  ];

  ngOnInit() {
    this.generateMap();
    // this.getDistance();
  }


  async plotOnMap()  {
    this.ifClicked = true;
    while (true) {
    this.markersLayer.clearLayers();
    await   this.makeAnAPICall();
    this.plotLatsOnMap();
    await this.getUserNotification();
    await this.delay(5000);

  }


  }

  generateMap(){

    if (!navigator.geolocation) {
      console.log('location is not supported');
    }


    navigator.geolocation.getCurrentPosition((position) => {
      const coords = position.coords;
      this.longitude = coords.longitude;
      this.latitude = coords.latitude;
      const latLong = [coords.latitude, coords.longitude];

      console.log(
        `lat: ${position.coords.latitude}, lon: ${position.coords.longitude}`
      );
       this.mymap = L.map('map').setView(latLong, 13);

      L.tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3VicmF0MDA3IiwiYSI6ImNrYjNyMjJxYjBibnIyem55d2NhcTdzM2IifQ.-NnMzrAAlykYciP4RP9zYQ',
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: 'mapbox/streets-v11',
          tileSize: 512,
          zoomOffset: -1,
          accessToken: 'your.mapbox.access.token',
        }
      ).addTo(this.mymap);

  var greenIcon = L.icon({
    iconUrl: 'assets/img/red_shadow.png',
   // iconRetinaUrl: 'img/marker-icon-2x-black.png',
    iconSize:     [25, 41], // size of the icon

});

     let marker =L.marker (latLong, {icon: greenIcon}).addTo(this.mymap);
      marker.bindPopup('<b>You</b>').openPopup();
      //marker._icon.classList.add("huechange");

//    HERE
var markerFrom = L.marker([50.120033,8.6527636], { color: "#F00", radius: 10 });
var markerTo =  L.circleMarker([50.161064818858684,8.748550415039064], { color: "#4AFF00", radius: 10 });
var from = markerFrom.getLatLng();
var to = markerTo.getLatLng();
markerFrom.bindPopup('pointA ' + (from).toString());
markerTo.bindPopup('pointB ' + (to).toString());
// this.mymap.addLayer(markerTo);
// this.mymap.addLayer(markerFrom);
var disatance = from.distanceTo(to)

console.log("distance from point a to point B",from.distanceTo(to).toString(),"m");

      var circle = L.circle(latLong, {
        color: '#ff6666',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 1500

    }).addTo(this.mymap);
      let popup = L.popup()
        .setLatLng(latLong)
        .setContent('You are in Disaster Zone')
        .openOn(this.mymap);
    });
    this.watchPosition();
  }

  async makeAnAPICall() {
    this.latitude = [];
    this.longitude = [];
    const res = await this.adminService.getUserList().toPromise();
      for(let i =0; i < res.length; i++) {
          this.latitude.push(res[i].latitude);
          this.longitude.push(res[i].longitude);
          this.resucerName.push(res[i].userName);
      };
 }


   plotLatsOnMap(): void {
     let marker;
     for(let i = 0; i < this.latitude.length; i++) {
       marker = L.marker([this.latitude[i], this.longitude[i]]).bindPopup('<b>' + this.resucerName[i]+'</b>');
       marker.addTo(this.markersLayer);
     }
     this.markersLayer.addTo(this.mymap);
   }

  watchPosition() {
    let desLat = 0;
    let desLon = 0;
    let id = navigator.geolocation.watchPosition(
      (position) => {
        console.log(
          `lat: ${position.coords.latitude}, lon: ${position.coords.longitude}`
        );
        if (position.coords.latitude === desLat) {
          navigator.geolocation.clearWatch(id);
        }
      },
      (err) => {
        console.log(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }

  public async getUserNotification() {
    const res= await this.adminService.getUserNotification().toPromise();
    if( res.notificationMessage !== "undefined" && res.notificationMessage !== "") {
      alert("Message from admin: "+res.notificationMessage);
      }
    // ,(error: HttpErrorResponse) => {
    //   alert(error.error.message);
    // });
   await this.delay(6000);
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  public sendUserDataToBackend() : void{
      if(this.userNameToBeAdded !== "" && this.uservictimHealthStatus !== "" && this.useremergencyType !== ""  && this.useremergencySeverity !== "") {
      this.user.userName = this.userNameToBeAdded;
      this.user.latitude = this.latitude;
      this.user.longitude = this.longitude;
      this.user.emergencySeverity = this.useremergencySeverity
      this.user.emergencyType = this.useremergencyType
      this.user.victimHealthStatus = this.uservictimHealthStatus
      this.adminService.addUser(this.user).subscribe(res => {
        alert(res.message);
      }, (error: HttpErrorResponse) => {
        alert(error.error.message);});
    } else {
      alert("Please fill all the fields before asking for help");
    }
  }



}




