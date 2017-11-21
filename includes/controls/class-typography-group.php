<?php

defined( 'ABSPATH' ) or die();

if ( class_exists( 'Tailor_Control' ) && ! class_exists( 'Tailor_Typography_Group_Control' ) ) {

	/**
	 * Tailor Input Group Control class.
	 *
	 * @since 1.0.0
	 */
	class Tailor_Typography_Group_Control extends Tailor_Control {


		/**
		 * Parameters array for this control.
		 *
		 * @since 1.0.0
		 * @var array
		 */
		public $params = array();

		/**
		 * Returns the parameters that will be passed to the client JavaScript via JSON.
		 *
		 * @since 1.0.0
		 *
		 * @return array The array to be exported to the client as JSON.
		 */
		public function to_json() {
			$array           = parent::to_json();
			$array['params'] = $this->params;

			return $array;
		}

		/**
		 * Prints the Underscore (JS) template for this control.
		 *
		 * Class variables are available in the JS object provided by the to_json method.
		 *
		 * @since 1.0.0
		 * @access protected
		 *
		 * @see Tailor_Control::to_json()
		 * @see Tailor_Control::print_template()
		 */
		protected function render_template() { ?>
			<div class="control__title typo_title">
				<span>Element</span>
			</div>
			<select name="<%= params.media %>[sub_element]" class="control-sub_element typography_element_select">
				<% _.each( params.element_blocks, function( selectData, selectKey ) { %>
					<option value="<%= selectKey %>"<%= is_selected_sub_element( selectKey ) %>><%= selectData %></option>
				<% } ) %>
			</select>
			<select name="<%= params.media %>[block_classes]" class="control-block_classes typography_element_select">
				<% _.each( params.block_classes, function( selectData, selectKey ) { %>
				<option value="<%= selectKey %>"<%= is_selected_class( selectKey ) %>><%= selectData %></option>
				<% } ) %>
			</select>


			<% _.each( params, function( data, key ) { %>
				<% if ( !_.isUndefined(data)) { %>
					<% if ( data.label) { %>
						<div class="control__title typo_title"><span><%= data.label %></span></div>
					<% } %>

					<% if ( data.type=='select') { %>
						<select name="<%= params.media %>[<%= key %>]" class="control-<%= key %>">
							<% _.each( data.choices, function( selectData, selectKey ) { %>
								<option value="<%= selectKey %>"<%= selected( params.media, key, selectKey ) %>><%= selectData %></option>
							<% } ) %>
						</select>
					<% } else if(data.type == 'button-group') { %>
						<div class="button-group">
							<% _.each( data.choices, function( buttonData, buttonKey ) { %>
								<button class="button button-small <%= active( params.media, key, buttonKey ) %>" name="<%= params.media %>[<%= key %>]" value="<%= buttonKey %>">
									<%= buttonData %>
								</button>
							<% } ) %>
						</div>
					<% } else if(data.type == 'range') { %>
						<div class="typo_range">
							<input type="range" name="<%= params.media %>[<%= key %>]" value="<%= getCurrentValue(params.media, key) %>" />
							<input type="text" name="<%= params.media %>[<%= key %>]" value="<%= getCurrentValue(params.media, key) %>" />
						</div>
					<% } %>
				<% } %>
			<% } ) %>

			<?php
		}
	}
}
