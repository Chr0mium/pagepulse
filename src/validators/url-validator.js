export function validateUrl(value) {
    if (typeof value !== "string" || value.trim() === "") {
      return {
        valid: false,
        code: "URL_REQUIRED",
        message: "Please provide a URL."
      };
    }
  
    if (value.length > 2048) {
      return {
        valid: false,
        code: "URL_TOO_LONG",
        message: "The URL is too long."
      };
    }
  
    let parsedUrl;
  
    try {
      parsedUrl = new URL(value);
    } catch {
      return {
        valid: false,
        code: "INVALID_URL",
        message: "Please provide a valid URL."
      };
    }
  
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return {
        valid: false,
        code: "UNSUPPORTED_PROTOCOL",
        message: "Only HTTP and HTTPS URLs are allowed."
      };
    }
  
    return {
      valid: true,
      url: parsedUrl
    };
  }