var app = angular.module('myApp', ['ngMaterial','ngAnimate','sweetalert']);

app.controller('mainCtrl', function ($scope, $http, $filter, $window) {
    $scope.sourceFrom = null;
    $scope.destinationTo = null;
    $scope.noOfSeats = [1, 2, 3, 4, 5, 6];
    $scope.sourceArray = ['Elumalai','M.Kallupatti','Mangalrevu Vilakku','Peraiyur Bus Stand','T.Kallupatti','Madurai Mattuthavani','Koyambedu','Nerkundram','Ashok Pillar','Alandur Court',
                            'Pallavaram','Chrompet','Tambaram','Perungalathur','Vandalur','Chengalpattu'];
    $scope.destinationArray = ['Perungalathur','Tambaram','Ashok Pillar','Vadapalani','Koyambedu','Madurai Mattuthavani','T.Kallupatti','Peraiyur Bus Stand',
                                'Mangalrevu Vilakku','M.Kallupatti','Elumalai'];
    $scope.maxSeats = null;
    $scope.journeyDate = null;
    $scope.showSeat = false;
    $scope.ticketPrice = null;
    $scope.busTiming = null;
    $scope.noBusFound = false;
    $scope.confirmationDetails = [];
    $scope.captchaValue = null;
    $scope.boardingPoint = [];
    $scope.dropPoint = [];
    $scope.boardingTimings = [];
    $scope.dropTimings = [];
    $scope.loaderShow = false;
    $scope.showLayout = function () {
        $scope.showSeat = true;
    }


    $scope.BookingDisable = function () {
        if ($scope.maxSeats > 0 && $scope.journeyDate != null) {
            return true;
        }
        return false
    }

    $scope.showDetails = true;
    $scope.tempo = [];
    $scope.seatLayout = [];
    $scope.temp1 = [];
    $scope.genderTemp = [];
    $scope.showSeat = function () {
        $scope.unformatDate = new Date($scope.journeyDate);
        $scope.displayDate = moment($scope.unformatDate).format("D-MMM-YYYY")
        $scope.formattedDate = $scope.unformatDate.getFullYear() + '-' + ($scope.unformatDate.getMonth() + 1) + '-' + $scope.unformatDate.getDate();
        var d = new Date();
        var ran = Math.floor(Math.random() * (99999 - 1)) + 1;
        $scope.pnr = $scope.sourceFrom.substring(0, 1) + $scope.destinationTo.substring(0, 1) + $scope.formattedDate.substring(5, 6)  + ran.toString() + d.getDate() + d.getMonth() + d.getSeconds();
        console.log($scope.pnr);
        var inData = {'date': $scope.formattedDate, 'source': $scope.sourceFrom, 'destination': $scope.destinationTo}
        $http.post('/showseat', inData).success(function (response) {

            if (response.length) {
                $scope.busTiming = response[0].timing;
                $scope.ticketPrice = response[0].price;
                $scope.boardingPoint = response[0].boardingPoint.location;
                $scope.dropPoint = response[0].dropPoint.location;
                $scope.boardingTimings = response[0].boardingPoint.timing;
                $scope.dropTimings = response[0].dropPoint.timing;
                $scope.showDetails = false;
                for (i = 0; i < response.length; i++) {
                    $scope.tempo.push(response[i].ticket);
                }
                for (i = 0; i < $scope.tempo.length; i++) {
                    $scope.seatLayout.push($scope.tempo[i][0]);
                }
            }
            else {
                $scope.noBusFound = true;
            }

            $scope.seatLayout = $filter('orderBy')($scope.seatLayout, 'seatNumber');
        });

    }


    $scope.totalSeats = 38;

    //$scope.seatLayout = [
    //    {id: 1, reserved: false, selected: false},
    //    {id: 2, reserved: true, selected: false},
    //    {id: 3, reserved: true, selected: false},
    //    {id: 4, reserved: false, selected: false},
    //    {id: 5, reserved: true, selected: false},
    //    {id: 6, reserved: false, selected: false},
    //    {id: 7, reserved: true, selected: false},
    //    {id: 8, reserved: false, selected: false},
    //    {id: 9, reserved: true, selected: false},
    //    {id: 10, reserved: false, selected: false},
    //    {id: 11, reserved: true, selected: false},
    //    {id: 12, reserved: false, selected: false},
    //    {id: 13, reserved: true, selected: false},
    //    {id: 14, reserved: false, selected: false},
    //    {id: 15, reserved: true, selected: false},
    //    {id: 16, reserved: false, selected: false},
    //    {id: 17, reserved: true, selected: false},
    //    {id: 18, reserved: false, selected: false},
    //    {id: 19, reserved: true, selected: false},
    //    {id: 20, reserved: false, selected: false},
    //    {id: 21, reserved: true, selected: false},
    //    {id: 22, reserved: false, selected: false},
    //    {id: 23, reserved: false, selected: false},
    //    {id: 24, reserved: false, selected: false},
    //    {id: 25, reserved: false, selected: false},
    //    {id: 26, reserved: false, selected: false},
    //    {id: 27, reserved: false, selected: false},
    //    {id: 28, reserved: false, selected: false},
    //    {id: 29, reserved: false, selected: false},
    //    {id: 30, reserved: false, selected: false},
    //    {id: 31, reserved: false, selected: false},
    //    {id: 32, reserved: false, selected: false},
    //    {id: 33, reserved: false, selected: false},
    //    {id: 34, reserved: false, selected: false},
    //    {id: 35, reserved: false, selected: false},
    //    {id: 36, reserved: false, selected: false},
    //    {id: 37, reserved: false, selected: false},
    //    {id: 38, reserved: false, selected: false}
    //];

    $scope.seatSelected = [];
    $scope.clickCount = 0;
    $scope.disabled = false;
    $scope.result = [];
    $scope.noDisable = [];
    $scope.checkMaxClass = false;
    $scope.intChange = 'fuck';
    $scope.disable = [
        {seatNumber: 1, value: false},
        {seatNumber: 2, value: false},
        {seatNumber: 3, value: false},
        {seatNumber: 4, value: false},
        {seatNumber: 5, value: false},
        {seatNumber: 6, value: false},
        {seatNumber: 7, value: false},
        {seatNumber: 8, value: false},
        {seatNumber: 9, value: false},
        {seatNumber: 10, value: false},
        {seatNumber: 11, value: false},
        {seatNumber: 12, value: false},
        {seatNumber: 13, value: false},
        {seatNumber: 14, value: false},
        {seatNumber: 15, value: false},
        {seatNumber: 16, value: false},
        {seatNumber: 17, value: false},
        {seatNumber: 18, value: false},
        {seatNumber: 19, value: false},
        {seatNumber: 20, value: false},
        {seatNumber: 21, value: false},
        {seatNumber: 22, value: false},
        {seatNumber: 23, value: false},
        {seatNumber: 24, value: false},
        {seatNumber: 25, value: false},
        {seatNumber: 26, value: false},
        {seatNumber: 27, value: false},
        {seatNumber: 28, value: false},
        {seatNumber: 29, value: false},
        {seatNumber: 30, value: false},
        {seatNumber: 31, value: false},
        {seatNumber: 32, value: false},
        {seatNumber: 33, value: false},
        {seatNumber: 34, value: false},
        {seatNumber: 35, value: false},
        {seatNumber: 36, value: false}

    ]
    $scope.noDisableClass = function (x) {

        return $scope.noDisable.indexOf(x) > -1;
    }
    $scope.removeDuplicates = function () {
        $scope.result = $scope.seatSelected.filter(function (item, pos) {
            return $scope.seatSelected.indexOf(item) == pos;
        })
    }

    $scope.checkDisabled = function (reserved, length, maxSeat, seatLayout) {

        if ((reserved || length == parseInt(maxSeat) ) && $scope.seatSelected.indexOf(seatLayout.seatNumber) < 0) {
            if (length == maxSeat) {
                $scope.disabled = true;
                $scope.addSeat(seatLayout);
            }
            return 0;
        }
        $scope.addSeat(seatLayout);

    }


    $scope.addSeat = function (x) {


        x.selected = !x.selected;
        $scope.disabled = !$scope.disabled;


        if ($scope.result.length < 7 && x.selected == false && x.reserved == false) {
            if ($scope.intChange > 0) {
                //$scope.intChange = $scope.intChange - 1;
            }
            else {
                $scope.intChange = 'fuck';
            }
            $scope.disable[x.seatNumber - 1].value = false;

            var index = $scope.seatSelected.indexOf(x.seatNumber);
            $scope.seatSelected.splice(index, 1);
            //$scope.disable[x.seatNumber].value = false;


        }

        if ($scope.result.length == parseInt($scope.maxSeats)) {
//                    x.selected = !x.selected;
            $scope.noDisable.push(x.seatNumber);
            $scope.disable[x.seatNumber - 1].value = $scope.noDisableClass(x.seatNumber);
            window.alert('You have selected the maximum number of seats !');


        }


//push to array and show passenger details

        if ($scope.result.length < 7 && x.selected == true && x.reserved == false && $scope.result.length < $scope.maxSeats) {

            $scope.intChange = parseInt($scope.maxSeats);
            $scope.disable[x.seatNumber - 1].value = true;

            if ($scope.result.length == 6) {
                window.alert('Only maximum of 6 seats can be selected!');
            }
            $scope.seatSelected.push(x.seatNumber);
            $scope.removeDuplicates();
            $scope.seatSelected = $scope.result;

        }


    }

    $scope.contactEmail = null;
    $scope.contactNumber = null;
    $scope.passengerOneName = null;
    $scope.passengerOneAge = null;
    $scope.passengerOneGender = null;
    $scope.passengerTwoName = null;
    $scope.passengerTwoAge = null;
    $scope.passengerTwoGender = null;
    $scope.passengerThreeName = null;
    $scope.passengerThreeAge = null;
    $scope.passengerThreeGender = null;
    $scope.passengerFourName = null;
    $scope.passengerFourAge = null;
    $scope.passengerFourGender = null;
    $scope.passengerFiveName = null;
    $scope.passengerFiveAge = null;
    $scope.passengerFiveGender = null;
    $scope.passengerSixName = null;
    $scope.passengerSixAge = null;
    $scope.passengerSixGender = null;
    $scope.EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
    $scope.PHONE_REGEXP = /^(\+\d{1,3}[- ]?)?\d{10}$/;
    $scope.paymentInfo = false;
    $scope.seatHide = false;
    $scope.bookingStatus = false;
    $scope.completeOrder = "Complete Order";
    $scope.completeOrderDisable = false;
    $scope.pnrNumber = null;
    $scope.nameList = [];
    $scope.ageList = [];
    $scope.genderList = [];
    $scope.paymentURL = null;
    $scope.payment = function () {
        $scope.loaderShow = true;
        $scope.seatHide = true;
        $scope.paymentInfo = true;
        $scope.nameList = [$scope.passengerOneName, $scope.passengerTwoName, $scope.passengerThreeName, $scope.passengerFourName, $scope.passengerFiveName, $scope.passengerSixName]
        $scope.ageList = [$scope.passengerOneAge, $scope.passengerTwoAge, $scope.passengerThreeAge, $scope.passengerFourAge, $scope.passengerFiveAge, $scope.passengerSixAge];
        $scope.genderList = [$scope.passengerOneGender, $scope.passengerTwoGender, $scope.passengerThreeGender, $scope.passengerFourGender, $scope.passengerFiveGender, $scope.passengerSixGender];
        //console.log($scope.passengerOneName);
        //console.log( $scope.contactEmail );
        //console.log($scope.contactNumber);
        //console.log($scope.ticketPrice * $scope.result.length);
        //console.log($scope.result.length);
        //console.log($scope.ticketPrice);
        //console.log($scope.sourceFrom);
        //console.log($scope.destinationTo);
        //console.log($scope.journeyDate);
        //console.log($scope.result);
        //console.log($scope.pnr);


        var inData = {
            'name' : $scope.passengerOneName,
            'email' : $scope.contactEmail,
            'mobile' : $scope.contactNumber,
            'totalCost' : $scope.ticketPrice * $scope.result.length,
            'quantity' : $scope.result.length,
            'cost' : $scope.ticketPrice,
            'destinationTo' : $scope.destinationTo,
            'sourceFrom' : $scope.sourceFrom,
            'dateOfJourney' : $scope.journeyDate,
            'totalSeats' : $scope.result,
            'pnr' : $scope.pnr
        };

        $http.post('/getpaymentdetails', inData).success(function (response) {
            $scope.paymentURL = response.longurl;
            $scope.loaderShow = false;

        });

    }
    $scope.confirmBooking = function () {

        $scope.completeOrderDisable = true;
        $scope.completeOrder = "Processing";


            for (j = 0; j < $scope.result.length; j++) {
                $scope.confirmationDetails.push({
                    id: j + 1,
                    passName: $scope.nameList[j],
                    passAge: $scope.ageList[j],
                    seatNos: $scope.result[j],
                    passGender: $scope.genderList[j]
                });
            }
            var inData = {
                'seatNo': $scope.result,
                'name': $scope.nameList,
                'age': $scope.ageList,
                'email': $scope.contactEmail,
                'contact': $scope.contactNumber,
                "dateOfJourney": $scope.formattedDate,
                "displayDate":$scope.displayDate,
                "gender": $scope.genderList,
                "pnr" : $scope.pnr,
                "boardingPoint":$scope.sourceFrom,
                "departureTiming":$scope.boardingTimings[$scope.boardingPoint.indexOf($scope.sourceFrom)],
                "dropPoint":$scope.destinationTo,
                "dropTiming":$scope.dropTimings[$scope.dropPoint.indexOf($scope.destinationTo)]
            };
            $http.post('/success', inData).success(function (response) {
                if (response == "bookError") {
                    swal({text:"Seat(s) you have selected is booked by someone else, please choose other seat(s)",icon: "error"}).then((willDelete) => {
                        if (willDelete){
                        location.href = "/bookfailed";

                    }
                });

                }
                else {

                    location.href = $scope.paymentURL;
                }


            });



    };
    var minDate = moment().format("MM/DD/YYYY");
    var pattern = /(\d{4})(\d{2})(\d{2})/;
    $scope.Mindate = new Date(minDate.replace(pattern, '$1-$2-$3'));
    var maxDate = moment().add(30, 'days').format("MM/DD/YYYY");
    $scope.Maxdate = new Date(maxDate.replace(pattern, '$1-$2-$3'));



});



