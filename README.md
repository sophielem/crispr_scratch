# CRISPR Server from Scratch

## Start nCSTB
sh /data/www_dev/crispr/bin/start_nCSTB.sh

In details with installation of dependencies and compilation :
#### Job-manager
cd /data/www_dev/crispr/lib/ms-jobmanager
npm install
tsc
cd build
logRoot="/data/www_dev/crispr/log/jobManager"
sudo -u ${USER} nohup node tests/engineBasic.js -e slurm -c /data/dev/crispr/tmp -a 192.168.117.151 -p 2129 -k 1234 -b ../../jobmanager.conf > $logRoot.log 2> $logRoot.err &

#### Launch motif-broker
cd /data/www_dev/crispr/lib/motif-broker
npm install
tsc
logRoot="/data/www_dev/crispr/log/motifBroker"
nohup node build/index.js --map /data/software/mobi/pycouch/1.0.0/data/3letter_prefixe_rules.json -r http://arwen-cdb.ibcp.fr:5984 > $logRoot.log 2> $logRoot.err &

#### Server
cd /data/www_dev/crispr/lib/nCSTB/
npm install
tsc
logRoot="/data/www_dev/crispr/log/nodeServer"
sudo -u ${USER} nohup node build/index.js -p 1234  -c /data/www_dev/crispr/lib/crispr-service-conf.json > $logRoot.log 2> $logRoot.err&


## Test
#### Motif-broker
cd /data/www_dev/crispr/lib/nCSTB
python test/motif_broker_test.py

### Server
python test/requests_test.py


# Construct Databases

## Crispr Database
### Create it

### Fill it
From the JsonTree file and the genome_ref_taxid file, use search_leaves_from_node which copy all fasta files from a subnode in a repository and create a config file with GCF, taxonID and ASM.
With these fasta file and necessary arguments, you can add them in the database and create their pickle and index file.
If you don't have the genome_ref_taxid file, you must give GCF and the taxon ID with the fasta file to insert them into database.

Then, create a loop in bash to launch *crispr_workflow_add.sh* . You must give :
| Variable    |                     Definition                    |
|-------------|:-------------------------------------------------:|
| $TAXID      |                    Taxonomy ID                    |
| $GCF        |                GCF of the organism                |
| $INFO_FILE  | Name of the file to insert into Taxonomy Database |
| $URL_TAXON  |         End_point to the Taxonomy Database        |
| $DB_NAME    |           Name of the Taxonomy Database           |
| $ORG_NAME   |                Name of the organism               |
| $FASTA_FILE |               Name of the fasta file              |
| $rfg        |          Path to the plain file Database          |
| $URL_CRISPR |          End_point to the CRISPR Database         |
| $MAP_FILE   |      The Mapping file for the CRISPR Database     |


## Create Taxon Database

1. open Apache couchDB app
2. Create the database
```sh
curl -X PUT http://127.0.0.1:5984/taxon_db
```
3. Convert the json file genome_ref_taxid.json to a pickle file ready to be insert into taxon_db
```python3
python create_file_taxondb.py -file genome_ref_taxid.json
```
4. Fill the database
```python3
python couchBuild.py taxon_db --url http://127.0.0.1:5984 --data path_folder
```

## Create Tree Database

1. open Apache couchDB app
2. Create the database
```sh
curl -X PUT http://127.0.0.1:5984/taxon_tree_db
```
3. Create the MaxiTree json file with the python script
```python3
python lib/maxi_tree.py -file genome_ref_taxid.json
```
4. Move the created json file in an empty folder
5. Fill the database
```python3
python couchBuild.py taxon_tree_db --url http://127.0.0.1:5984 --data path_folder
```
