<?php

//returns value from array or default value
if ( ! function_exists( 'typo_arr_get' ) ) {
	function typo_arr_get( $array, $index, $default = null ) {
		return isset( $array[ $index ] ) ? $array[ $index ] : $default;
	}
}

//returns cached google fonts or makes cache and returns
if ( ! function_exists( 'typo_get_google_fonts' ) ) {
	function typo_get_google_fonts() {
		$google_fonts = get_transient( 'google_fonts_cache' );
		if ( ! $google_fonts ) {
			$google_fonts = json_decode( file_get_contents( 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key=AIzaSyAuU_YX4RcZ8kzlHKldYnUuQniDzSmRB2w' ) );
			set_transient( 'google_fonts_cache', $google_fonts, WEEK_IN_SECONDS );
		}

		return $google_fonts;
	}
}

//returns unit from array or defaul unit
if ( ! function_exists( 'typo_get_unit' ) ) {
	function typo_get_unit( $font_size_unit, $default = 'px' ) {
		$size_units = array( 'pt', 'px', 'em', 'rm' );

		return in_array( $font_size_unit, $size_units ) ? $font_size_unit : $default;
	}
}

//returns src font by font name
if ( ! function_exists( 'typo_get_font_src' ) ) {
	function typo_get_font_src( $font_name ) {
		return typo_arr_get( typo_get_fonts_src_array(), $font_name, '' );
	}
}

//returns array of fonts name => src
if ( ! function_exists( 'typo_get_fonts_src_array' ) ) {
	function typo_get_fonts_src_array() {
		$fonts = get_transient( 'typo_fonts_src_array' );
		if ( ! $fonts ) {
			$google_fonts = typo_get_google_fonts();
			if ( isset( $google_fonts->items ) ) {
				foreach ( $google_fonts->items as $item ) {
					if ( isset( $item->files->regular ) ) {
						$fonts[ $item->family ] = $item->files->regular;
					}
				}
			}
			set_transient( 'typo_fonts_src_array', $fonts, WEEK_IN_SECONDS );
		}

		return $fonts;
	}
}

//defines additional controls
if ( ! function_exists( 'typo_add_control_definitions' ) ) {
	function typo_add_control_definitions(
		Tailor_Element $element,
		$control_definitions,
		&$priority = 0,
		$priority_step = 10
	) {
		foreach ( $control_definitions as $control_id => $attribute_control_argument ) {
			$setting_args = typo_arr_get( $attribute_control_argument, 'setting', [ ] );
			if ( $setting_args ) {
				$setting_args = apply_filters( 'tailor_setting_args_' . $element->tag, $setting_args, $element );

				$setting_args = apply_filters(
					'tailor_setting_args_' . $element->tag . '_' . $control_id,
					$setting_args,
					$element
				);

				$element->add_setting( $control_id, $setting_args );
			}

			$control_args = typo_arr_get( $attribute_control_argument, 'control', [ ] );
			if ( $control_args ) {
				if ( ! typo_arr_get( $control_args, 'priority' ) ) {
					$control_args['priority'] = $priority += $priority_step;
				}

				$control_args = apply_filters(
					'tailor_control_args_' . $control_args['type'],
					$control_args,
					$element
				);

				$control_args = apply_filters( 'tailor_control_args_' . $element->tag, $control_args, $element );

				$control_args = apply_filters(
					'tailor_control_args_' . $element->tag . '_' . $control_id,
					$control_args,
					$element
				);

				$element->add_control( $control_id, $control_args );
			}
		}

		return $priority;
	}
}

//defines additional controls for for typography control
if ( ! function_exists( 'tailor_add_typography_controls' ) ) {

	/* @var $element Tailor_Element */
	function tailor_add_typography_controls( Tailor_Element $element ) {
		$priority          = 0;
		$priority_step     = 10;
		$section           = 'attributes';
		$translation_group = 'tailor-typography';
		$dependencies      = array(
			'typography' => array(
				'condition' => 'contains',
				'value'     => '1',
			),
		);
		$sizes             = array(
			'pt' => 'pt',
			'px' => 'px',
			'em' => 'em',
			'rm' => 'rm'
		);
		$google_fonts      = typo_get_google_fonts();
		$fonts             = [
			'inherit' => 'inherit'
		];
		if ( isset( $google_fonts->items ) ) {
			foreach ( $google_fonts->items as $item ) {
				if ( isset( $item->files->regular ) ) {
					$fonts[ $item->family ] = $item->family;
				}
			}
		}


		/* var $control Tailor_Control */
		foreach ( (array) $element->controls() as $control ) {
			if ( $control->section == $section ) {
				$priority += $priority_step;
			}
		}

		$control_definitions = array(
			'typography'              => array(
				'setting' => array(
					'default' => 'default',
				),
				'control' => array(
					'label'   => __( 'Typography', $translation_group ),
					'type'    => 'switch',
					'section' => $section,
				),
			),
			'typography_group'        => array(
				'setting' => array(
					'default' => '',
					'refresh' => array(
						'method' => 'js',
					),
				),
				'control' => array(
					'type'         => 'typography-group',
					'dependencies' => $dependencies,
					'section'      => $section,
					'params'       => array(
						'font_size_unit'      => array(
							'label'   => __( 'Size', $translation_group ),
							'type'    => 'button-group',
							'choices' => $sizes,
						),
						'font_size'           => array(
							'type' => 'range',
						),
						'font_family'         => array(
							'label'   => __( 'Family', $translation_group ),
							'type'    => 'select',
							'choices' => $fonts,
						),
						'font_weight'         => array(
							'label'   => __( 'Weight', $translation_group ),
							'type'    => 'select',
							'choices' => array(
								'inherit' => 'inherit',
								'bold'    => 'bold',
								'bolder'  => 'bolder',
								'lighter' => 'lighter',
								'normal'  => 'normal',
								100       => 100,
								200       => 200,
								300       => 300,
								400       => 400,
								500       => 500,
								600       => 600,
								700       => 700,
								800       => 800,
								900       => 900
							),
						),
						'font_transform'      => array(
							'label'   => __( 'Transform', $translation_group ),
							'type'    => 'select',
							'choices' => array(
								'none'       => 'none',
								'inherit'    => 'inherit',
								'capitalize' => 'capitalize',
								'lowercase'  => 'lowercase',
								'uppercase'  => 'uppercase',
							),
						),
						'font_style'          => array(
							'label'   => __( 'Style', 'tailor' ),
							'type'    => 'select',
							'choices' => array(
								'normal'  => 'normal',
								'inherit' => 'inherit',
								'italic'  => 'italic',
								'oblique' => 'oblique',
							),
						),
						'line_height_unit'    => array(
							'label'   => __( 'Line-height', 'tailor' ),
							'type'    => 'button-group',
							'choices' => $sizes
						),
						'line_height'         => array(
							'type' => 'range',
						),
						'letter_spacing_unit' => array(
							'label'   => __( 'Letter-spacing', 'tailor' ),
							'type'    => 'button-group',
							'choices' => $sizes,
						),
						'letter_spacing'      => array(
							'type' => 'range'
						)
					)
				),
			),
			'typography_group_tablet' => array(
				'setting' => array(
					'sanitize_callback' => 'tailor_sanitize_text',
					'refresh'           => array(
						'method' => 'js',
					),
				),
			),
			'typography_group_mobile' => array(
				'setting' => array(
					'sanitize_callback' => 'tailor_sanitize_text',
					'refresh'           => array(
						'method' => 'js',
					),
				),
			)
		);

		typo_add_control_definitions( $element, $control_definitions, $priority, $priority_step );

	}

	add_action( 'tailor_element_register_controls', 'tailor_add_typography_controls' );
}

// returns value for element
if ( ! function_exists( 'tailor_get_element_param_value_for_media' ) ) {
	function tailor_get_element_param_value_for_media($elementClassName, $param, $media, $cleanValues) {
		$result = null;

		$elementName = explode('.', $elementClassName)[0];

		//try to get element value
		try {
			$result = $cleanValues[$media][$elementClassName][$param];
		} catch ( Exception $e) {
		}

		//try to get element value without class
		if ($result === null) {
			try {
				$result = $cleanValues[$media][$elementName][$param];
			} catch ( Exception $e) {
			}
		}

		//try to get element all value
		if ($result === null) {
			try {
				$result = $cleanValues[$media]['all'][$param];
			} catch ( Exception $e) {
			}
		}

		//try to get desktop element value
		if ($result === null && $media != 'desktop') {
			try {
				$result = $cleanValues['desktop'][$elementClassName][$param];
			} catch ( Exception $e) {
			}
		}

		//try to get desktop element value without class
		if ($result === null && $media != 'desktop') {
			try {
				$result = $cleanValues['desktop'][$elementName][$param];
			} catch ( Exception $e) {
			}
		}

		//try to get desktop all value
		if ($result === null && $media != 'desktop') {
			try {
				$result = $cleanValues['desktop']['all'][$param];
			} catch ( Exception $e) {
			}
		}

		return $result;
	}
}


//additional css handler
if ( ! function_exists( 'tailor_add_typography_css_rules' ) ) {
	function tailor_add_typography_css_rules( $css_rules, $atts, $mainElement ) {
		$typography_enabled = isset( $atts['typography'] ) && $atts['typography'] == '1' ? true : false;

		if ( $typography_enabled ) {
			$screen_sizes = array(
				'desktop',
				'tablet',
				'mobile',
			);

			$allValues = [
				'desktop' => json_decode( typo_arr_get( $atts, 'typography_group' ), true ),
				'tablet'  => json_decode( typo_arr_get( $atts, 'typography_group_tablet' ), true ),
				'mobile'  => json_decode( typo_arr_get( $atts, 'typography_group_mobile' ), true ),
			];

			$params = [
				'font_family',
				'font_size',
				'font_weight',
				'font_transform',
				'font_style',
				'line_height',
				'letter_spacing'
			];

			$mergedAll = [];

			foreach ( $screen_sizes as $media ) {
				if (!is_array($allValues[$media])) {
					$allValues[$media] = ["all" => []];
				}

				$mergedAll = array_merge($mergedAll, $allValues[$media]);
			}

			foreach ( $screen_sizes as $media ) {
				if ( ! is_array( $allValues[ $media ] ) ) {
					$allValues[ $media ] = [ "all" => [ ] ];
				}

				foreach ( $mergedAll as $element => $paramValues ) {
					$font_size_unit = typo_get_unit( tailor_get_element_param_value_for_media(
						$element,
						'font_size_unit',
						$media,
						$allValues
					) );

					$line_height_unit = typo_get_unit( tailor_get_element_param_value_for_media(
						$element,
						'line_height_unit',
						$media,
						$allValues
					) );

					$letter_spacing_unit = typo_get_unit( tailor_get_element_param_value_for_media(
						$element,
						'letter_spacing_unit',
						$media,
						$allValues
					) );

					$typo_element = $element == 'all' ? '*' : $element;
					$typo_element = $typo_element == 'blockquote' ? $typo_element . ' *' : $typo_element;

					$selectors = array($typo_element);

					foreach ( $params as $param ) {
						$value = tailor_get_element_param_value_for_media( $element, $param, $media, $allValues );
						if ( $value !== null ) {
							switch ( $param ) {
								case 'font_family':
									if ( $value !== 'inherit' ) {
										$font_name   = $value;
										$css_rules[] = array(
											'selectors'    => $selectors,
											'media'        => $media,
											'declarations' => array(
												'font-family' => $font_name
											),
										);
									}
									break;
								case 'font_size':
									$value       = $value == '0' ? 'inherit' : $value . $font_size_unit;
									$css_rules[] = array(
										'selectors'    => $selectors,
										'media'        => $media,
										'declarations' => array(
											'font-size' => $value,
										),
									);
									break;
								case 'font_weight':
									$css_rules[] = array(
										'selectors'    => $selectors,
										'media'        => $media,
										'declarations' => array(
											'font-weight' => $value,
										),
									);
									break;
								case 'font_transform':
									$css_rules[] = array(
										'selectors'    => $selectors,
										'media'        => $media,
										'declarations' => array(
											'text-transform' => $value,
										),
									);
									break;
								case 'font_style':
									$css_rules[] = array(
										'selectors'    => $selectors,
										'media'        => $media,
										'declarations' => array(
											'font-style' => $value,
										),
									);
									break;
								case 'line_height':
									$value       = $value == '0' ? 'inherit' : $value . $line_height_unit;
									$css_rules[] = array(
										'selectors'    => $selectors,
										'media'        => $media,
										'declarations' => array(
											'line-height' => $value,
										),
									);
									break;
								case 'letter_spacing':
									$value       = $value == '0' ? 'inherit' : $value . $letter_spacing_unit;
									$css_rules[] = array(
										'selectors'    => $selectors,
										'media'        => $media,
										'declarations' => array(
											'letter-spacing' => $value,
										),
									);
									break;
							}
						}
					}
				}
			}
		}
		
		return $css_rules;
	}

	add_filter( 'tailor_element_css_rule_sets', 'tailor_add_typography_css_rules', 10, 3 );
}