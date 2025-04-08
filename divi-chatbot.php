<?php
/*
Plugin Name: Divi Chatbot Assistant
Description: A chatbot with voice input and OpenAI Assistants API integration for Divi and other themes.
Version: 1.0
Author: Filippo Dellamea De Estrada
*/

// Enqueue CSS and JS
add_action('wp_enqueue_scripts', function() {
    wp_enqueue_style('divi-chatbot-style', plugin_dir_url(__FILE__) . 'style.css');
    wp_enqueue_script('divi-chatbot-script', plugin_dir_url(__FILE__) . 'chatbot.js', [], false, true);
    wp_localize_script('divi-chatbot-script', 'DiviChatbotSettings', [
        'apiKey' => get_option('divi_chatbot_api_key'),
        'assistantId' => get_option('divi_chatbot_assistant_id'),
    ]);
});

// Shortcode to display chatbot
add_shortcode('chatbot_divi', function() {
    ob_start();
    include plugin_dir_path(__FILE__) . 'chatbot-ui.php';
    return ob_get_clean();
});

// Admin settings
add_action('admin_menu', function() {
    add_options_page('Divi Chatbot Settings', 'Divi Chatbot', 'manage_options', 'divi-chatbot', 'divi_chatbot_settings_page');
});

add_action('admin_init', function() {
    register_setting('divi_chatbot_settings', 'divi_chatbot_api_key');
    register_setting('divi_chatbot_settings', 'divi_chatbot_assistant_id');
});

function divi_chatbot_settings_page() {
    ?>
    <div class="wrap">
        <h1>Divi Chatbot Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('divi_chatbot_settings'); ?>
            <?php do_settings_sections('divi_chatbot_settings'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">OpenAI API Key</th>
                    <td><input type="text" name="divi_chatbot_api_key" value="<?php echo esc_attr(get_option('divi_chatbot_api_key')); ?>" size="50" /></td>
                </tr>
                <tr valign="top">
                    <th scope="row">Assistant ID</th>
                    <td><input type="text" name="divi_chatbot_assistant_id" value="<?php echo esc_attr(get_option('divi_chatbot_assistant_id')); ?>" size="50" /></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}
?>