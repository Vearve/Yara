import base64
from typing import Any

from rest_framework.renderers import JSONRenderer
from rest_framework.utils.encoders import JSONEncoder as DRFJSONEncoder


class BytesSafeJSONEncoder(DRFJSONEncoder):
    """JSON encoder that extends DRF's encoder (handles date/datetime/Decimal)
    and also safely serializes raw bytes/memoryview objects."""

    def default(self, obj: Any):
        if isinstance(obj, (bytes, bytearray, memoryview)):
            try:
                return bytes(obj).decode('utf-8')
            except UnicodeDecodeError:
                return base64.b64encode(bytes(obj)).decode('ascii')
        return super().default(obj)


class SafeJSONRenderer(JSONRenderer):
    """JSON renderer that uses the BytesSafeJSONEncoder to avoid
    UnicodeDecodeError when DRF attempts to serialize bytes objects.
    """

    encoder_class = BytesSafeJSONEncoder
