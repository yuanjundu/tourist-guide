# class gmapsRouter:
#     def db_for_read(self, model, **hints):
#         if model._meta.app_label == 'gmaps':
#             return 'tourism'
#         return None

#     def db_for_write(self, model, **hints):
#         if model._meta.app_label == 'gmaps':
#             return 'tourism'
#         return None

#     def allow_relation(self, obj1, obj2, **hints):
#         if obj1._meta.app_label == 'gmaps' or obj2._meta.app_label == 'gmaps':
#             return True
#         return None

#     def allow_migrate(self, db, app_label, model_name=None, **hints):
#         if app_label == 'gmaps':
#             return db == 'tourism'
#         return None

class gmapsRouter:
    def db_for_read(self, model, **hints):
        return 'default'

    def db_for_write(self, model, **hints):
        if model._meta.app_label == 'gmaps':
            return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return True
