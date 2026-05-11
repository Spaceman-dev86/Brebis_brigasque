
function ajaxSubmitCommentForm(){
	"use strict";

	var options = { 
		success: function(){
			$j("#commentform textarea").val("");
			$j("#commentform .success p").text("Comment has been sent!");
		}
	}; 
	
	$j('#commentform').submit(function() {
		$j(this).find('input[type="submit"]').next('.success').remove();
		$j(this).find('input[type="submit"]').after('<div class="success"><p></p></div>');
		$j(this).ajaxSubmit(options); 
		return false; 
	}); 
}
var header_height = 90;
var min_header_height_scroll = 57;
var min_header_height_sticky = 60;
var scroll_amount_for_sticky = 85;
var min_header_height_fixed_hidden = 45;
var content_height_default = 60;
var default_content_padding = 42; /* padding top 21 + padding bottom 21 */
var default_content_icon_size = 24;
var content_height_with_icon = content_height_default + default_content_icon_size;
var header_bottom_border_weight = 1;
var scroll_amount_for_fixed_hiding = 200;
var menu_item_margin = 0;
var large_menu_item_border = 0;
var element_appear_amount = -150;
var paspartu_width_init = 0.02;
var directionNavArrows = 'arrow_carrot-';
var directionNavArrowsTestimonials = 'fa fa-angle-';
var add_for_admin_bar = 0;
	header_height = 200;
	min_header_height_sticky = 120;
	scroll_amount_for_sticky = 100;
    min_header_height_fixed_hidden = 70;




var logo_height = 130; // cayman logo height
var logo_width = 280; // cayman logo width
	    logo_width = 613;
    logo_height = 570;

		menu_item_margin = 2;
var header_top_height = 0;	
var loading_text;
loading_text = 'Loading new posts...';
var finished_text;
finished_text = 'No more posts';

var piechartcolor;
piechartcolor	= "#e6ae48";

	piechartcolor = "#424242";



var no_ajax_pages = [];
var qode_root = 'https://brebisbrigasque.fr/';
var theme_root = 'https://brebisbrigasque.fr/wp-content/themes/bodega/';
var header_style_admin = "";
if(typeof no_ajax_obj !== 'undefined') {
no_ajax_pages = no_ajax_obj.no_ajax_pages;
}