"""Link customers to users

Revision ID: 08d3a830cefd
Revises: ad674ea7ed92
Create Date: 2025-06-25 11:55:47.362161
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '08d3a830cefd'
down_revision = 'ad674ea7ed92'
branch_labels = None
depends_on = None


def upgrade():
    # ✅ No longer trying to drop nonexistent table 'admins'

    # Add user_id to customers table with constraints
    with op.batch_alter_table('customers', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.create_unique_constraint('uq_customers_user_id', ['user_id'])
        batch_op.create_foreign_key(
            'fk_customers_user_id',
            'users',
            ['user_id'],
            ['id']
        )

    # Add last_login column to users table
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('last_login', sa.DateTime(), nullable=True))


def downgrade():
    # Remove last_login from users
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('last_login')

    # Remove user_id and constraints from customers
    with op.batch_alter_table('customers', schema=None) as batch_op:
        batch_op.drop_constraint('fk_customers_user_id', type_='foreignkey')
        batch_op.drop_constraint('uq_customers_user_id', type_='unique')
        batch_op.drop_column('user_id')

    # No recreation of admins table since we didn’t drop it
