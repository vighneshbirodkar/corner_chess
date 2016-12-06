
'use strict';
console.log('corner chess'); 

function waitAndHideAlert(){
  $("#alertbox").delay(1000).animate({opacity: 0.0}, 300)
};


function showAlert(msg){
  $("#alertbox").text(msg);
  $("#alertbox").animate({opacity: 1.0}, 300, waitAndHideAlert);
};


showAlert("ekrgbjerg");
