INSERT INTO person (id, name, full_name, system_admin) VALUES (1, 'test', 'System Admin Test User', 1);
INSERT INTO person (id, name, full_name, system_admin) VALUES (2, 'other_test', 'Non System Admin Test User', 0);

INSERT INTO band (id, name) VALUES (1, 'band1');
INSERT INTO band (id, name) VALUES (2, 'band2');
INSERT INTO band (id, name) VALUES (3, 'band3');
INSERT INTO band (id, name) VALUES (4, 'band4');

INSERT INTO band_member (id, band_id, person_id, band_admin) VALUES (1, 1, 1, 0);
INSERT INTO band_member (id, band_id, person_id, band_admin) VALUES (2, 2, 1, 1);
INSERT INTO band_member (id, band_id, person_id, band_admin) VALUES (3, 3, 2, 0);
INSERT INTO band_member (id, band_id, person_id, band_admin) VALUES (4, 4, 2, 1);
