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

defined('MOODLE_INTERNAL') || die;

/**
 * This is the filter itself.
 *
 * @package    filter_signature
 * @copyright  2021 Robert Schrenk (www.schrenk.cc)
 * @author     Robert Schrenk
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class filter_signature extends moodle_text_filter {
    public static $component = 'filter_signature';
    public static $filearea = 'signature';
    /**
     * Function filter finds signature fields.
     */
    public function filter($text, array $options = array()) {
        global $DB, $OUTPUT, $PAGE, $USER;

        if (strpos($text, '{signature') === false) {
            return $text;
        }

        $texts = explode($text, '{signature');
        $text = '';
        foreach ($texts as $txtpart) {
            $embed = '';

            $subkey = substr($txtpart, 0, strpos($txtpart, '}'));
            $txtpart = substr($txtpart, strpos($txtpart, '}') + 1);

            $filearea = self::$filearea;
            if (!empty($key)) {
                $filearea .= '_' . $subkey;
            }

            $params = array(
                'contextid' => $PAGE->context->id,
                'signaturepath' => \filter_signature\lib::get_signature($PAGE->context->id, $subkey),
                'subkey' => $subkey,
            );

            $embed = $OUTPUT->render_from_template('filter_signature/field', $params);
            $text .= $embed . $txtpart;
        }
        return $text;
    }
}
