﻿$('#save-batterytracking-button').on('click', function(e)
{
	e.preventDefault();

	var jsonForm = $('#batterytracking-form').serializeJSON();
	Grocy.FrontendHelpers.BeginUiBusy("batterytracking-form");

	Grocy.Api.Get('batteries/get-battery-details/' + jsonForm.battery_id,
		function (batteryDetails)
		{
			Grocy.Api.Get('batteries/track-charge-cycle/' + jsonForm.battery_id + '?tracked_time=' + $('#tracked_time').find('input').val(),
				function(result)
				{
					Grocy.FrontendHelpers.EndUiBusy("batterytracking-form");
					toastr.success(L('Tracked charge cycle of battery #1 on #2', batteryDetails.battery.name, $('#tracked_time').find('input').val()) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoChargeCycle(' + result.charge_cycle_id + ')"><i class="fas fa-undo"></i> ' + L("Undo") + '</a>');

					$('#battery_id').val('');
					$('#battery_id_text_input').focus();
					$('#battery_id_text_input').val('');
					$('#tracked_time').find('input').val(moment().format('YYYY-MM-DD HH:mm:ss'));
					$('#tracked_time').find('input').trigger('change');
					$('#battery_id_text_input').trigger('change');
					Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
				},
				function(xhr)
				{
					Grocy.FrontendHelpers.EndUiBusy("batterytracking-form");
					console.error(xhr);
				}
			);
		},
		function(xhr)
		{
			Grocy.FrontendHelpers.EndUiBusy("batterytracking-form");
			console.error(xhr);
		}
	);
});

$('#battery_id').on('change', function(e)
{
	var input = $('#battery_id_text_input').val().toString();
	$('#battery_id_text_input').val(input);
	$('#battery_id').data('combobox').refresh();

	var batteryId = $(e.target).val();
	if (batteryId)
	{
		Grocy.Components.BatteryCard.Refresh(batteryId);
		$('#tracked_time').find('input').focus();
		Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
	}
});

$('.combobox').combobox({
	appendId: '_text_input',
	bsVersion: '4'
});

$('#battery_id').val('');
$('#battery_id_text_input').focus();
$('#battery_id_text_input').val('');
$('#battery_id_text_input').trigger('change');
Grocy.FrontendHelpers.ValidateForm('batterytracking-form');

$('#batterytracking-form input').keyup(function (event)
{
	Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
});

$('#batterytracking-form input').keydown(function(event)
{
	if (event.keyCode === 13) //Enter
	{
		event.preventDefault();
		
		if (document.getElementById('batterytracking-form').checkValidity() === false) //There is at least one validation error
		{
			return false;
		}
		else
		{
			$('#save-batterytracking-button').click();
		}
	}
});

$('#tracked_time').find('input').on('keypress', function (e)
{
	Grocy.FrontendHelpers.ValidateForm('batterytracking-form');
});

function UndoChargeCycle(chargeCycleId)
{
	Grocy.Api.Get('batteries/undo-charge-cycle/' + chargeCycleId.toString(),
		function(result)
		{
			toastr.success(L("Charge cycle successfully undone"));
		},
		function(xhr)
		{
			console.error(xhr);
		}
	);
};
