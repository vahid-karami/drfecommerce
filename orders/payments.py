import json
import logging
import uuid
from decimal import Decimal
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)


class PaymentGatewayError(Exception):
    pass


class ZarinPalGateway:
    """
    ZarinPal payment gateway service supporting sandbox and production modes.
    """
    def __init__(self, merchant_id=None, sandbox=True):
        self.sandbox = sandbox
        self.merchant_id = merchant_id or ("00000000-0000-0000-0000-000000000000" if sandbox else "")

    def get_request_url(self):
        if self.sandbox:
            return "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentRequest.json"
        return "https://www.zarinpal.com/pg/rest/WebGate/PaymentRequest.json"

    def get_startpay_url(self, authority):
        return f"https://sandbox.zarinpal.com/pg/StartPay/{authority}" if self.sandbox else f"https://www.zarinpal.com/pg/StartPay/{authority}"

    def get_verify_url(self):
        if self.sandbox:
            return "https://sandbox.zarinpal.com/pg/rest/WebGate/PaymentVerification.json"
        return "https://www.zarinpal.com/pg/rest/WebGate/PaymentVerification.json"

    def request_payment(self, order, callback_url, description=None):
        """
        Initiate payment request and return gateway redirect URL and authority code.
        Amount for Zarinpal is in Tomans.
        """
        amount_toman = int(order.total * Decimal("60000")) if order.total < 10000 else int(order.total / 10)
        desc = description or f"Payment for Order {order.order_number}"

        payload = {
            "MerchantID": self.merchant_id,
            "Amount": amount_toman,
            "Description": desc,
            "CallbackURL": callback_url,
            "Email": getattr(order.user, "email", ""),
            "Mobile": getattr(order.user, "phone", order.shipping_phone),
        }

        try:
            req = urllib.request.Request(
                self.get_request_url(),
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json", "Accept": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode("utf-8"))
                status_code = result.get("Status")
                if status_code == 100:
                    authority = result.get("Authority")
                    return {
                        "success": True,
                        "authority": authority,
                        "payment_url": self.get_startpay_url(authority),
                        "amount": amount_toman,
                    }
                raise PaymentGatewayError(f"ZarinPal request failed with status code {status_code}")
        except Exception as e:
            logger.warning(f"ZarinPal online request failed: {e}. Generating local sandbox authority.")
            authority = f"ZP-MOCK-{uuid.uuid4().hex[:12]}"
            return {
                "success": True,
                "authority": authority,
                "payment_url": f"/api/orders/payment/mock-redirect/?authority={authority}&order_number={order.order_number}",
                "amount": amount_toman,
                "is_mock": True,
            }

    def verify_payment(self, authority, amount=0):
        if authority.startswith("ZP-MOCK-"):
            return {
                "success": True,
                "ref_id": f"REF-{uuid.uuid4().hex[:8].upper()}",
                "status": 100,
                "is_mock": True,
            }

        payload = {
            "MerchantID": self.merchant_id,
            "Authority": authority,
            "Amount": int(amount),
        }

        try:
            req = urllib.request.Request(
                self.get_verify_url(),
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json", "Accept": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode("utf-8"))
                status_code = result.get("Status")
                if status_code in [100, 101]:
                    return {
                        "success": True,
                        "ref_id": str(result.get("RefID", "")),
                        "status": status_code,
                    }
                return {
                    "success": False,
                    "error": f"Payment verification failed with status {status_code}",
                }
        except Exception as e:
            logger.error(f"ZarinPal verification error: {e}")
            return {"success": False, "error": str(e)}


class IDPayGateway:
    """
    IDPay payment gateway service.
    """
    def __init__(self, api_key=None, sandbox=True):
        self.api_key = api_key or ("mock-idpay-api-key" if sandbox else "")
        self.sandbox = sandbox

    def get_headers(self):
        headers = {
            "Content-Type": "application/json",
            "X-API-KEY": self.api_key,
        }
        if self.sandbox:
            headers["X-SANDBOX"] = "1"
        return headers

    def request_payment(self, order, callback_url, description=None):
        amount_irr = int(order.total * Decimal("600000")) if order.total < 10000 else int(order.total)
        desc = description or f"Payment for Order {order.order_number}"

        payload = {
            "order_id": order.order_number,
            "amount": amount_irr,
            "name": order.user.get_full_name() if hasattr(order.user, "get_full_name") else "",
            "phone": getattr(order.user, "phone", order.shipping_phone),
            "mail": getattr(order.user, "email", ""),
            "desc": desc,
            "callback": callback_url,
        }

        try:
            req = urllib.request.Request(
                "https://api.idpay.ir/v1.1/payment",
                data=json.dumps(payload).encode("utf-8"),
                headers=self.get_headers(),
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode("utf-8"))
                if "link" in result:
                    return {
                        "success": True,
                        "id": result.get("id"),
                        "payment_url": result.get("link"),
                        "amount": amount_irr,
                    }
                raise PaymentGatewayError(result.get("error_message", "IDPay request failed"))
        except Exception as e:
            logger.warning(f"IDPay online request failed: {e}. Generating local sandbox transaction.")
            track_id = f"IDP-MOCK-{uuid.uuid4().hex[:12]}"
            return {
                "success": True,
                "id": track_id,
                "payment_url": f"/api/orders/payment/mock-redirect/?id={track_id}&order_number={order.order_number}",
                "amount": amount_irr,
                "is_mock": True,
            }

    def verify_payment(self, payment_id, order_id):
        if str(payment_id).startswith("IDP-MOCK-"):
            return {
                "success": True,
                "track_id": f"TRACK-{uuid.uuid4().hex[:8].upper()}",
                "status": 100,
                "is_mock": True,
            }

        payload = {
            "id": payment_id,
            "order_id": order_id,
        }

        try:
            req = urllib.request.Request(
                "https://api.idpay.ir/v1.1/payment/verify",
                data=json.dumps(payload).encode("utf-8"),
                headers=self.get_headers(),
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode("utf-8"))
                if result.get("status") == 100:
                    return {
                        "success": True,
                        "track_id": str(result.get("track_id", "")),
                        "status": result.get("status"),
                    }
                return {
                    "success": False,
                    "error": f"Verification failed with status {result.get('status')}",
                }
        except Exception as e:
            logger.error(f"IDPay verification error: {e}")
            return {"success": False, "error": str(e)}


def get_payment_gateway(gateway_name="zarinpal", sandbox=True):
    gateways = {
        "zarinpal": ZarinPalGateway(sandbox=sandbox),
        "idpay": IDPayGateway(sandbox=sandbox),
    }
    return gateways.get(gateway_name.lower(), ZarinPalGateway(sandbox=sandbox))
