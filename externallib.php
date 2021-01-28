<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
* @package    filter_signature
* @copyright  2021 Robert Schrenk (www.schrenk.cc)
* @author     Robert Schrenk
* @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

require_once($CFG->libdir . "/externallib.php");

class filter_signature_external extends external_api {
    public static function sign_parameters() {
        return new external_function_parameters(array(
            'contextid' => new external_value(PARAM_INT, 'the contextid'),
            'subkey' => new external_value(PARAM_ALPHANUM, 'the subkey of the signature field'),
            'signature' => new external_value(PARAM_TEXT, 'the signature itself'),
        ));
    }
    public static function sign($contextid, $subkey, $signature) {
        global $DB, $USER;

        $params = self::validate_parameters(self::sign_parameters(), array('contextid' => $contextid, 'subkey' => $subkey, 'signature' => $signature));

        $imageurl = "";
        if (!empty($params['contextid'])) {
            $imageurl = \filter_signature\lib::set_signature($params['contextid'], $params['subkey'], $params['signature']);
        }

        return $imageurl;
    }
    public static function sign_returns() {
        return new external_value(PARAM_URL, 'Returns path of image, if saving was successful.');
    }

}
