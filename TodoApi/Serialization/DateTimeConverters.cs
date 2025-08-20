using System;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace TodoApi.Serialization
{
    // Serializes DateTime as MM/dd/yyyy and parses strings back
    public sealed class DateTimeConverter : JsonConverter<DateTime>
    {
        private readonly string _format;
        private readonly CultureInfo _culture;

        public DateTimeConverter(string format = "MM/dd/yyyy", string? culture = null)
        {
            _format = format;
            _culture = culture is null ? CultureInfo.InvariantCulture : new CultureInfo(culture);
        }

        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            switch (reader.TokenType)
            {
                case JsonTokenType.String:
                    var s = reader.GetString();
                    if (string.IsNullOrWhiteSpace(s)) return default;
                    if (DateTime.TryParseExact(s, _format, _culture, DateTimeStyles.AssumeLocal | DateTimeStyles.AllowWhiteSpaces, out var dtExact))
                        return dtExact;
                    if (DateTime.TryParse(s, _culture, DateTimeStyles.AssumeLocal | DateTimeStyles.AllowWhiteSpaces, out var dt))
                        return dt;
                    throw new JsonException($"Unable to parse DateTime from '{s}'.");

                case JsonTokenType.Number:
                    if (reader.TryGetInt64(out var ms))
                        return DateTimeOffset.FromUnixTimeMilliseconds(ms).LocalDateTime;
                    break;
            }
            throw new JsonException($"Unexpected token parsing DateTime. Token: {reader.TokenType}");
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value.ToString(_format, _culture));
        }
    }

    // Nullable version for DateTime?
    public sealed class NullableDateTimeConverter : JsonConverter<DateTime?>
    {
        private readonly DateTimeConverter _inner;

        public NullableDateTimeConverter(string format = "MM/dd/yyyy", string? culture = null)
        {
            _inner = new DateTimeConverter(format, culture);
        }

        public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null) return null;

            if (reader.TokenType == JsonTokenType.String)
            {
                var s = reader.GetString();
                if (string.IsNullOrWhiteSpace(s)) return null;
                if (DateTime.TryParseExact(s, "MM/dd/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal | DateTimeStyles.AllowWhiteSpaces, out var dtExact))
                    return dtExact;
                if (DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal | DateTimeStyles.AllowWhiteSpaces, out var dt))
                    return dt;
                throw new JsonException($"Unable to parse DateTime from '{s}'.");
            }

            if (reader.TokenType == JsonTokenType.Number)
            {
                if (reader.TryGetInt64(out var ms))
                    return DateTimeOffset.FromUnixTimeMilliseconds(ms).LocalDateTime;
            }

            var nonNull = _inner.Read(ref reader, typeof(DateTime), options);
            return nonNull;
        }

        public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                _inner.Write(writer, value.Value, options);
            else
                writer.WriteNullValue();
        }
    }
}
