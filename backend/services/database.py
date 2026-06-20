from sqlalchemy import create_engine, text
from config import DATABASE_URL

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

def get_customer_stats(customer_id: int) -> dict:
    query = text("""
        SELECT txn_count, avg_amount 
        FROM customer_stats 
        WHERE customer_id = :customer_id
    """)

    try:
        with engine.connect() as conn:
            result = conn.execute(
                query,
                {"customer_id": customer_id}
            )

            row = result.fetchone()

            if row:
                return {
                    "txn_count": int(row.txn_count) if row.txn_count is not None else 0,
                    "avg_amount": float(row.avg_amount) if row.avg_amount is not None else 0.0
                }

    except Exception as e:
        print(f"Database error: {e}")

    return {
        "txn_count": 0,
        "avg_amount": 0.0
    }




def get_users() -> list:

    query = text("""
        SELECT *
        FROM customer_stats
    """)

    try:
        with engine.connect() as conn:
            result = conn.execute(query)

            users = []

            for row in result:
                users.append({
                    "customer_id": row.customer_id,
                    "customer_name": row.customer_name,
                    "gender": row.gender,
                    "avg_amount": row.avg_amount,
                    "txn_count": row.txn_count,
                    "dob": row.dob,
                    "job": row.job
                })

            return users

    except Exception as e:
        print(f"Database Error: {e}")
        raise e


def get_states_and_category() -> dict:
    query1 = text("""
        SELECT * from category;
    """)
     
    query2 = text("""
        SELECT * from state;
    """)

    try:
        with engine.connect() as conn:
            result_category = conn.execute(query1)
            result_state = conn.execute(query2)

            categories = [dict(row._mapping) for row in result_category]
            states = [dict(row._mapping) for row in result_state]

            return {
                "categories": categories,
                "states": states
            }

    except Exception as e:
        print(f"Database Error: {e}")
        raise e

def update_customer_stats(customer_id: int, amt: float):
    query = text("""
        UPDATE customer_stats
        SET avg_amount = ((avg_amount * txn_count) + :amt) / (txn_count + 1),
            txn_count = txn_count + 1
        WHERE customer_id = :customer_id
    """)
    try:
        with engine.begin() as conn:
            conn.execute(query, {"customer_id": customer_id, "amt": amt})
    except Exception as e:
        print(f"Database error updating stats: {e}")
        raise e

def get_cities_and_jobs() -> dict:
    query_city = text("SELECT city_name, city_population from city;")
    query_job = text("SELECT job_name from job;")
    try:
        with engine.connect() as conn:
            result_city = conn.execute(query_city)
            result_job = conn.execute(query_job)

            cities = [dict(row._mapping) for row in result_city]
            jobs = [dict(row._mapping) for row in result_job]

            return {
                "cities": cities,
                "jobs": jobs
            }
    except Exception as e:
        print(f"Database Error: {e}")
        raise e
