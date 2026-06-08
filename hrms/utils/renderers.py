import json
import base64
from typing import Any

from rest_framework.renderers import JSONRenderer


class BytesSafeJSONEncoder(json.JSONEncoder):
    """JSON encoder that safely serializes bytes.

    - If bytes decode as UTF-8, returns the decoded string.
    - Otherwise returns a base64 encoded ASCII string so JSON encoding
      doesn't raise UnicodeDecodeError during rendering.
    """

    def default(self, obj: Any):
        # Handle raw bytes that can appear in error contexts or unexpected fields
        if isinstance(obj, (bytes, bytearray)):
            try:
                return obj.decode('utf-8')
            except UnicodeDecodeError:
                return base64.b64encode(bytes(obj)).decode('ascii')
        return super().default(obj)


class SafeJSONRenderer(JSONRenderer):
    """JSON renderer that uses the BytesSafeJSONEncoder to avoid
    UnicodeDecodeError when DRF attempts to serialize bytes objects.
    """

    encoder_class = BytesSafeJSONEncoder
