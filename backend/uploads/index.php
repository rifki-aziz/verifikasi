<?php
// Prevent direct access to uploads directory
http_response_code(403);
echo '403 Forbidden - Direct access not allowed';
exit();
?>