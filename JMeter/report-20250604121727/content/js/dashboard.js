/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.9958972675802, "KoPercent": 0.004102732419791581};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7151427842007367, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9428571428571428, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [0.9357142857142857, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9714285714285714, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.9285714285714286, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [0.8928571428571429, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.7844129554655871, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.8699392712550608, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.797, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9714285714285714, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.32776089159067884, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.3861336032388664, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9361702127659575, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [0.914387031408308, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.9785714285714285, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8357142857142857, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9148936170212766, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.38145896656534956, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.7818825910931174, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.9088145896656535, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.42299898682877407, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.35, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.8318135764944276, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.8768996960486323, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.2145748987854251, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.8410931174089069, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.9340505144995322, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.839918946301925, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8682877406281662, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.922998986828774, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.8870314083080041, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.727, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9174265450861195, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.9245187436676798, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 24374, 1, 0.004102732419791581, 977.4499056371538, 0, 23771, 330.0, 3211.0, 5513.9000000000015, 11070.420000000093, 6.90839335497249, 158.0911219526358, 6.6294538689227736], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 70, 0, 0.0, 291.8285714285714, 102, 4853, 108.0, 129.9, 2675.4500000000007, 4853.0, 0.07902461052156243, 0.057339146110860245, 0.06312708145179499], "isController": false}, {"data": ["1.4 Select Organisations-1", 70, 0, 0.0, 327.0142857142858, 115, 4681, 122.0, 183.7, 2295.2000000000025, 4681.0, 0.07902398603759059, 1.077936559544009, 0.05108777222352047], "isController": false}, {"data": ["2.0 Register attendance", 1000, 0, 0.0, 9443.749999999995, 3624, 41665, 7637.5, 17287.899999999998, 21072.55, 30494.97, 0.30397077017074037, 59.58275333493931, 1.3203721423897878], "isController": true}, {"data": ["1.3 Sign-in-1", 70, 0, 0.0, 187.08571428571426, 109, 4033, 114.0, 143.39999999999998, 360.35000000000093, 4033.0, 0.07895000998153698, 0.7100874921190973, 0.05211934252687402], "isController": false}, {"data": ["1.3 Sign-in-0", 70, 0, 0.0, 489.68571428571425, 328, 6451, 361.0, 520.5, 614.4000000000001, 6451.0, 0.07892837813458417, 0.05603606533578387, 0.07206839214437127], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 619.0571428571429, 221, 6656, 233.0, 1915.9999999999993, 3848.600000000005, 6656.0, 0.07901426320328339, 1.1351355722495133, 0.11420030228599551], "isController": false}, {"data": ["2.4 Patient attending session-1", 988, 0, 0.0, 1125.465587044534, 306, 23517, 403.0, 2977.5000000000005, 5874.149999999999, 10895.060000000003, 0.3005581925379432, 14.624647132171377, 0.20076348017182924], "isController": false}, {"data": ["2.4 Patient attending session-0", 988, 0, 0.0, 845.3815789473687, 175, 21167, 223.0, 2130.1000000000017, 5058.749999999995, 9643.820000000012, 0.30057739457202254, 0.22337980313473624, 0.24598032876108872], "isController": false}, {"data": ["2.3 Search by first/last name", 1000, 0, 0.0, 866.8430000000006, 302, 14272, 409.0, 1277.299999999998, 3791.349999999999, 9361.480000000007, 0.30388865033629836, 16.86790754753806, 0.26211019300651933], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 174.4, 98, 3348, 103.0, 111.9, 126.25000000000001, 3348.0, 0.0788243017574441, 0.47502418568865973, 0.047494720883147476], "isController": false}, {"data": ["3.0 Nurse triage", 987, 0, 0.0, 2636.2380952381013, 764, 21496, 1242.0, 6672.200000000001, 9175.0, 17034.68, 0.3011828521680435, 33.906138286565564, 0.9045453593161775], "isController": true}, {"data": ["4.2 Vaccination batch-2", 987, 0, 0.0, 0.32624113475177346, 0, 6, 0.0, 1.0, 1.0, 1.0, 0.3019129719799067, 1.5071954108769425, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 988, 0, 0.0, 1970.939271255063, 503, 23771, 669.0, 6065.100000000001, 8346.2, 15087.440000000002, 0.3005387186951509, 14.847050628739623, 0.44669915024806617], "isController": false}, {"data": ["4.2 Vaccination batch-0", 987, 0, 0.0, 336.9311043566364, 112, 6518, 123.0, 316.20000000000005, 1810.5999999999963, 4827.08, 0.30190133607399794, 0.22583635100847893, 0.27123948162898254], "isController": false}, {"data": ["4.2 Vaccination batch-1", 987, 0, 0.0, 483.634245187437, 134, 14679, 148.0, 431.2000000000005, 2752.7999999999975, 7122.24, 0.301899027469141, 4.107074828881827, 0.21647137159120977], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 393.7857142857141, 290, 6085, 301.0, 343.3, 420.3500000000002, 6085.0, 0.07892143709172249, 0.40732401858374356, 0.04277480232998632], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 676.9714285714284, 437, 6564, 478.0, 724.6, 1554.7000000000028, 6564.0, 0.07891867881112392, 0.7658348743614634, 0.1241581948874225], "isController": false}, {"data": ["2.1 Open session", 1000, 0, 0.0, 4694.723, 1969, 22707, 3581.5, 8253.0, 10060.549999999992, 17000.460000000003, 0.3039763141656002, 5.245310191679864, 0.19927369134397047], "isController": false}, {"data": ["3.3 Nurse triage complete", 987, 0, 0.0, 538.8885511651474, 170, 14639, 204.0, 521.8000000000002, 2714.3999999999915, 6825.840000000001, 0.30159082283876715, 7.0009407023972345, 0.2038094232465106], "isController": false}, {"data": ["4.3 Vaccination confirm", 987, 0, 0.0, 1974.245187436677, 496, 17107, 721.0, 5674.200000000004, 8731.999999999989, 13558.2, 0.3020641355303934, 7.329139641503122, 0.7026387507658718], "isController": false}, {"data": ["4.1 Vaccination questions", 988, 1, 0.10121457489878542, 1062.339068825911, 263, 20043, 469.0, 2929.8, 5209.849999999995, 10797.660000000016, 0.2967849300542804, 3.4506634010561696, 0.6052378254909117], "isController": false}, {"data": ["3.1 Nurse triage new", 987, 0, 0.0, 523.5481256332312, 127, 13530, 153.0, 617.8000000000022, 2589.9999999999986, 6010.880000000004, 0.3015699972378999, 3.396008213982246, 0.2073293731010562], "isController": false}, {"data": ["3.2 Nurse triage result", 987, 0, 0.0, 1573.801418439717, 433, 21149, 790.0, 3691.6000000000004, 6585.399999999994, 15255.36, 0.3012051869547332, 23.524763817520927, 0.49398505381792074], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 2108.057142857143, 1199, 7644, 1290.0, 5782.099999999999, 6996.150000000001, 7644.0, 0.07841854441738381, 3.6213438753996545, 0.37333047269018177], "isController": true}, {"data": ["3.2 Nurse triage result-1", 987, 0, 0.0, 744.0202634245179, 216, 16520, 409.0, 806.0000000000009, 3052.7999999999993, 8364.120000000003, 0.30122421549708556, 23.302976323475285, 0.21392835966095033], "isController": false}, {"data": ["3.2 Nurse triage result-0", 987, 0, 0.0, 829.689969604863, 192, 20691, 295.0, 760.2000000000012, 4458.399999999998, 12857.000000000004, 0.3012369025277347, 0.2232830674454775, 0.28009969831292075], "isController": false}, {"data": ["4.0 Vaccination", 988, 1, 0.10121457489878542, 3854.9311740890657, 322, 23399, 1644.0, 9210.000000000002, 12853.149999999996, 18019.72000000001, 0.29631593516919247, 16.353833952463937, 1.7710564380072873], "isController": true}, {"data": ["2.5 Patient return to consent page", 988, 0, 0.0, 800.2307692307692, 166, 17551, 242.5, 1557.6000000000008, 3950.8999999999965, 8758.190000000002, 0.30005943484959524, 6.801461177741634, 0.20804902221016855], "isController": false}, {"data": ["1.5 Open Sessions list", 1069, 0, 0.0, 421.15902712815733, 123, 10453, 150.0, 377.0, 2018.5, 5035.1999999999825, 0.30682154122573624, 3.3510665205748382, 0.1982143462570068], "isController": false}, {"data": ["4.2 Vaccination batch", 987, 0, 0.0, 821.1742654508619, 248, 20630, 285.0, 2304.8000000000025, 3906.199999999992, 7704.960000000001, 0.30188748497444506, 5.8398119688485455, 0.487690132530747], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 987, 0, 0.0, 794.4488348530892, 200, 16421, 263.0, 1535.600000000001, 4318.599999999998, 8485.04, 0.3020936282118108, 0.2277517688890392, 0.28968872209039], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 987, 0, 0.0, 421.3404255319144, 113, 13020, 123.0, 326.4000000000001, 2437.3999999999915, 6704.880000000003, 0.3021024124117261, 0.2256917436474321, 0.20386012400049097], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 987, 0, 0.0, 758.311043566362, 172, 13384, 237.0, 957.2000000000005, 4654.999999999995, 9657.160000000002, 0.3020963096502478, 6.876479324040377, 0.20916629252150942], "isController": false}, {"data": ["2.2 Session register", 1000, 0, 0.0, 1134.5590000000025, 302, 20935, 481.0, 2736.399999999996, 5797.299999999976, 9899.78, 0.3041319056570663, 15.789761677866831, 0.2020487247064899], "isController": false}, {"data": ["4.1 Vaccination questions-0", 987, 0, 0.0, 621.9108409321165, 131, 16349, 329.0, 480.20000000000005, 2986.5999999999985, 7293.52, 0.30197005631879226, 0.22529886803679078, 0.4001131331236676], "isController": false}, {"data": ["4.1 Vaccination questions-1", 987, 0, 0.0, 441.08105369807515, 124, 13020, 138.0, 342.0, 2662.599999999982, 6357.4800000000005, 0.30197218123348446, 3.2878596809543055, 0.2159340357908933], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 1, 100.0, 0.004102732419791581], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 24374, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 988, 1, "422/Unprocessable Entity", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
