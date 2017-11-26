$(function () {
    var $changeFareDate = $('#changeFareDate');
    var $source = $('#source');
    var $destination = $('#destination');
    var $newFare = $('#toPrice');

    $('#modify-fare').on('click', function () {
        var data = {
            changeFareDate :$changeFareDate.val(),
            source: $source.val(),
            destination: $destination.val(),
            newFare:$newFare.val()
        };

        $.ajax({
           type:'POST',
            url:'/setprice',
            data:data,
            success:function(){
                alert('Ticket price changed successfully !');

            },
            error: function(){
                alert('error occured while updating new ticket price! Try again later')
            }
        });

    });

    var $addSource = $('#addSource');
    var $addDestination = $('#addDestination');
    var $addDate = $('#addDate');
    var $addPrice = $('#addPrice');

    $('#add-bus').on('click',function(){
        $("#add-bus").attr("disabled", true);
        var data = {
            addSource : $addSource.val(),
            addDestination : $addDestination.val(),
            addDate : $addDate.val(),
            addPrice : $addPrice.val()
        };

        $.ajax({
            type:'POST',
            url:'/addbus',
            data:data,
            success:function(response){
                if(response.status == "error"){
                    alert('Warning: Bus already added for the selected date !');
                }
                if(response.status == "success"){
                    alert('Bus successfully added for the selected date !');
                }

                $("#add-bus").attr("disabled", false);

            },
            error: function(){
                alert('Error occured while adding new buses! Try again later');
            }
        })
    });

    var $removeSource = $('#removeSource');
    var $removeDestination = $('#removeDestination');
    var $removeDate = $('#removeDate');

    $('#remove-bus').on('click',function(){
        $("#remove-bus").attr("disabled", true);
        var data = {
            removeSource : $removeSource.val(),
            removeDestination : $removeDestination.val(),
            removeDate : $removeDate.val()
        };

        $.ajax({
            type:'POST',
            url:'/removebus',
            data:data,
            success:function(response){
                console.log(response.status.n)
                if(response.status == "error"){
                    alert('Warning: Bus not found for the selected date !');
                }
                if(response.status == "success"){
                    alert('Bus successfully removed for the selected date !');
                }

                $("#remove-bus").attr("disabled", false);

            },
            error: function(){
                alert('Error occured while adding new buses! Try again later');
            }
        })
    });



});
