from backend.utils.helpers import (
    safe_int,
    safe_float,
    safe_bool,
    format_seconds,
    calculate_percentage,
    limit_score
)


print("================================")
print("HELPERS TEST")
print("================================")

print("Safe integer:", safe_int("100"))

print("Safe float:", safe_float("25.5"))

print("Safe boolean:", safe_bool("true"))

print(
    "Formatted time:",
    format_seconds(3665)
)

print(
    "Percentage:",
    calculate_percentage(25, 100)
)

print(
    "Limited score:",
    limit_score(120)
)

print("================================")