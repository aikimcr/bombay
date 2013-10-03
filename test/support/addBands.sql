INSERT INTO person (id, name, full_name) VALUES (1, 'test', 'Test User');

INSERT INTO band (id, name) VALUES (1, 'band1');
INSERT INTO band (id, name) VALUES (2, 'band2');
INSERT INTO band (id, name) VALUES (3, 'band3');

INSERT INTO band_member (id, band_id, person_id, band_admin) VALUES (1, 1, 1, 0);
INSERT INTO band_member (id, band_id, person_id, band_admin) VALUES (2, 2, 1, 1);
