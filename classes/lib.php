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

namespace filter_signature;

class lib {
    public static $component = 'filter_signature';
    public static $filearea = 'signature';

    public static function get_signature($contextid, $subkey, $userid = 0) {
        if (empty($userid)) {
            global $USER;
            $userid = $USER->id;
        }
        $fs = \get_file_storage();
        // Prepare file record object
        $f = array(
            'component' => self::$component,
            'filearea' => self::$filearea,
            'itemid' => $userid,
            'contextid' => $contextid,
            'filepath' => '/',
            'filename' => 'signature.jpg'
        );
        $file = $fs->get_file($f['contextid'], $f['component'], $f['filearea'],
                              $f['itemid'], $f['filepath'], $f['filename']);
        if ($file) {
            $url = \moodle_url::make_file_url(
                        '/pluginfile.php',
                        array(
                            $f['contextid'], $f['component'], $f['filearea'],
                            $f['itemid'], $f['filepath'], $f['filename']
                        )
                    );
            return $url->__toString();
        } else {
            return "";
        }
    }

    public static function set_signature($contextid, $subkey, $signature) {
        global $USER;

        $context = \context::instance_by_id($contextid, MUST_EXIST);
        if (has_capability('filter_signature/sign', $context, $USER, false)) {
            list($type, $signature) = explode(';', $signature);
            list(, $signature)      = explode(',', $signature);
            $signature = base64_decode($signature);
            list(, $type) = explode('/', $type);

            $fs = \get_file_storage();
            $f = array(
                'component' => self::$component,
                'filearea' => self::$filearea,
                'itemid' => $USER->id,
                'contextid' => $contextid,
                'filepath' => '/',
                'filename' => "signature.$type"
            );

            $fs->create_file_from_string($f, $signature);
        }
        return self::get_signature($contextid, $subkey, $USER->id);
    }

}
