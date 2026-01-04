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

    var data = {"OkPercent": 99.96228245056307, "KoPercent": 0.03771754943693087};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7602619526601891, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.23733162283515075, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9775497113534317, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9881334188582425, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.36563307493540054, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.36967418546365916, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9598914354644149, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.5443548387096774, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9553679131483716, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9523522316043426, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.3733850129198966, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.6446440025657473, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4567030147530468, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9695317511225144, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.4291314837153197, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.36528497409326427, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.3275862068965517, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.30357142857142855, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.8977900552486188, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9801154586273252, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9746632456703015, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9285714285714286, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 18559, 7, 0.03771754943693087, 371.33913465165153, 3, 19392, 197.0, 833.0, 1118.0, 1810.0, 4.954383049971489, 2028.5573311597398, 23.92451374404828], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 28, 0, 0.0, 129.5, 69, 412, 95.0, 279.5000000000002, 411.1, 412.0, 0.00828518065244614, 3.3486254404461215, 0.036280896233882365], "isController": false}, {"data": ["2.0 Register attendance", 1559, 7, 0.4490057729313663, 1638.4785118665811, 612, 4692, 1534.0, 2452.0, 2827.0, 3804.8000000000025, 0.4551252090612831, 845.8070811814448, 8.940185704459527], "isController": true}, {"data": ["2.5 Select patient", 1559, 0, 0.0, 178.3220012828734, 74, 1693, 127.0, 320.0, 480.0, 808.2000000000012, 0.4564180754439463, 185.6320185326342, 1.8964238278779808], "isController": false}, {"data": ["2.3 Search by first/last name", 1559, 0, 0.0, 147.54650416933936, 68, 1293, 109.0, 240.0, 368.0, 653.4000000000024, 0.4552437568969137, 185.2497304769525, 1.9660946403114403], "isController": false}, {"data": ["4.0 Vaccination for flu", 387, 0, 0.0, 1361.8268733850125, 768, 3598, 1249.0, 1928.6, 2273.7999999999993, 3078.2000000000003, 0.11676997943400051, 139.553875114639, 1.9749339199214413], "isController": true}, {"data": ["4.0 Vaccination for hpv", 399, 0, 0.0, 1344.5338345864661, 747, 3509, 1218.0, 1953.0, 2329.0, 3036.0, 0.1169151284073874, 139.48895486720755, 1.980132092484848], "isController": true}, {"data": ["1.2 Sign-in page", 1658, 0, 0.0, 224.565138721351, 15, 2133, 145.0, 415.3000000000004, 634.2499999999989, 1467.7900000000016, 0.4649429379289961, 187.85194495009364, 2.3099310886142543], "isController": false}, {"data": ["7.1 Name search", 29, 0, 0.0, 6327.379310344828, 5467, 7996, 6090.0, 7480.0, 7868.0, 7996.0, 0.008254101078583312, 3.336303709026571, 0.0357656403652582], "isController": false}, {"data": ["2.4 Patient attending session", 868, 7, 0.8064516129032258, 768.8571428571429, 105, 3495, 649.0, 1192.0, 1485.0, 2087.229999999998, 0.25372134381112843, 103.48612096475641, 1.292415360510845], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 32.0, 32, 32, 32.0, 32.0, 32.0, 32.0, 31.25, 9.796142578125, 18.4326171875], "isController": false}, {"data": ["1.1 Homepage", 1658, 0, 0.0, 234.97406513872147, 32, 1960, 156.0, 414.0, 661.1499999999999, 1505.6400000000003, 0.46506735482423234, 187.75165773817872, 2.3019759182836266], "isController": false}, {"data": ["1.3 Sign-in", 1658, 0, 0.0, 249.1658624849216, 84, 2174, 161.0, 477.10000000000014, 700.5499999999995, 1473.7400000000011, 0.46478496967264055, 187.96019239728966, 2.422590692288522], "isController": false}, {"data": ["Run some searches", 28, 0, 0.0, 11034.82142857143, 9011, 26412, 9939.0, 12509.000000000015, 24408.149999999987, 26412.0, 0.008297618998228458, 18.592467249223727, 0.1814620861229138], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 387, 0, 0.0, 1365.762273901809, 780, 4203, 1235.0, 1988.0, 2366.399999999999, 3198.6400000000003, 0.11676441286206775, 140.09363423502413, 1.978294194311974], "isController": true}, {"data": ["2.1 Open session", 1559, 0, 0.0, 712.3232841565106, 257, 3053, 620.0, 1181.0, 1434.0, 1920.2000000000003, 0.45518341205368884, 183.52152443039665, 1.8946317805430553], "isController": false}, {"data": ["4.3 Vaccination confirm", 1559, 0, 0.0, 943.9512508017967, 503, 3926, 813.0, 1431.0, 1793.0, 2563.0000000000005, 0.4557500069429523, 184.10555663886927, 2.7472291682196954], "isController": false}, {"data": ["4.1 Vaccination questions", 1559, 0, 0.0, 213.55484284797973, 97, 1466, 156.0, 368.0, 536.0, 865.6000000000049, 0.4553690168556638, 179.76648137269805, 2.5994067903034437], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 49.0, 49, 49, 49.0, 49.0, 49.0, 49.0, 20.408163265306122, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1658, 0, 0.0, 1114.4457177322083, 540, 5713, 944.0, 1674.1000000000001, 1967.3999999999996, 4459.790000000002, 0.4650081376424087, 773.8363305780678, 8.93356381602141], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 386, 0, 0.0, 1339.9637305699487, 772, 3723, 1239.5, 1959.4, 2311.5, 3033.1299999999987, 0.11532836465275256, 138.01355382553672, 1.9541742248200982], "isController": true}, {"data": ["7.0 Open Children Search", 29, 0, 0.0, 1518.3793103448274, 1324, 2061, 1489.0, 1814.0, 2051.5, 2061.0, 0.008305088871610486, 4.027745205511572, 0.03450460144880843], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 49.0, 49, 49, 49.0, 49.0, 49.0, 49.0, 20.408163265306122, 5.859375, 12.595663265306122], "isController": false}, {"data": ["7.5 year group", 28, 0, 0.0, 1520.2142857142856, 1370, 2032, 1476.0, 1793.3000000000002, 1946.0499999999995, 2032.0, 0.008285813208178098, 4.1159329182967035, 0.03646168172046033], "isController": false}, {"data": ["7.2 No Consent search", 29, 0, 0.0, 3350.793103448276, 1547, 19392, 1764.0, 13642.0, 18059.5, 19392.0, 0.008224220613299981, 4.370467594798322, 0.03613494776201941], "isController": false}, {"data": ["1.4 Open Sessions list", 1629, 0, 0.0, 412.9637814610195, 207, 2724, 325.0, 680.0, 878.5, 1494.1000000000001, 0.45687829003553776, 210.1815000564612, 1.897886992248775], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 1559, 0, 0.0, 195.4586273252086, 87, 1182, 143.0, 348.0, 483.0, 772.4000000000001, 0.4553711450086912, 180.97214406357335, 2.3669606313718003], "isController": false}, {"data": ["2.2 Session register", 1559, 0, 0.0, 172.21167415009597, 65, 2085, 109.0, 363.0, 496.0, 854.0000000000027, 0.455286167360742, 188.7135068579487, 1.899060737281045], "isController": false}, {"data": ["7.3 Due vaccination", 28, 0, 0.0, 330.28571428571433, 232, 700, 279.5, 537.9000000000001, 663.0999999999998, 700.0, 0.008287306717069277, 3.3494847330051756, 0.036176903272479834], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, 100.0, 0.03771754943693087], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 18559, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 868, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
