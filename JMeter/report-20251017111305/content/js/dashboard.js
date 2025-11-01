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

    var data = {"OkPercent": 99.98637045113807, "KoPercent": 0.01362954886193267};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5344692737430168, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2973790322580645, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4475728155339806, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.001838235294117647, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9037383177570093, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8489010989010989, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6725978647686833, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4594594594594595, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4359205776173285, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.49513618677042803, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4920353982300885, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.5825852782764811, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.7609489051094891, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5989110707803993, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7337, 1, 0.01362954886193267, 716.0876379991826, 0, 4881, 648.0, 1341.0, 1525.0999999999995, 2150.579999999999, 6.109482729907071, 2086.876779885421, 21.783764608591746], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 496, 0, 0.0, 1591.6693548387086, 1069, 4881, 1432.5, 2198.2, 2603.2, 3561.379999999996, 0.46696768508301856, 184.85975387431367, 2.4221705324090634], "isController": false}, {"data": ["4.1 Vaccination questions", 515, 0, 0.0, 1304.6699029126205, 616, 2501, 1242.0, 1511.2000000000003, 1771.6, 2103.4799999999987, 0.4665007192263516, 180.63585095392605, 2.316769281256001], "isController": false}, {"data": ["Get Next Patient from STS", 554, 0, 0.0, 0.6516245487364628, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.46812167445601977, 0.1967445184768639, 0.29884576901237314], "isController": false}, {"data": ["2.0 Register attendance", 544, 1, 0.18382352941176472, 2713.086397058822, 1306, 5647, 2696.5, 3604.5, 3934.5, 4866.75, 0.46509639635788486, 847.9028348491001, 8.065471976125336], "isController": true}, {"data": ["1.0 Login", 556, 0, 0.0, 3333.796762589927, 2059, 5291, 3287.0, 3913.8, 4275.6, 4926.059999999998, 0.46650009145415466, 760.849299704494, 7.698477277837721], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 125, 0, 0.0, 3621.896, 1971, 6573, 3500.0, 4311.4, 4535.699999999999, 6210.039999999993, 0.11390995463649967, 132.65097212463937, 1.6529758292189058], "isController": true}, {"data": ["2.5 Select patient", 535, 0, 0.0, 445.32149532710304, 335, 1705, 395.0, 589.4000000000001, 663.5999999999998, 1062.92, 0.4680058925003587, 186.58437633676917, 1.6634771577586631], "isController": false}, {"data": ["2.3 Search by first/last name", 546, 0, 0.0, 471.43406593406604, 338, 1536, 443.5, 637.3, 715.9499999999999, 1084.0899999999986, 0.4675622281652293, 187.21216820931159, 1.7287569476022022], "isController": false}, {"data": ["4.0 Vaccination for flu", 126, 0, 0.0, 3712.9761904761913, 1862, 6865, 3562.5, 4591.9, 4944.849999999999, 6607.420000000004, 0.11587538797562938, 134.4069774543051, 1.6732095643177376], "isController": true}, {"data": ["4.0 Vaccination for hpv", 137, 0, 0.0, 3691.598540145986, 1910, 6363, 3571.0, 4527.4, 4824.9, 6162.360000000002, 0.12614776046289783, 145.8275493429382, 1.8214776978586187], "isController": true}, {"data": ["1.2 Sign-in page", 562, 0, 0.0, 703.3950177935948, 197, 2222, 568.0, 1231.7, 1296.3500000000004, 1766.8400000000006, 0.47027635848781885, 184.99360518683653, 1.9788653021713882], "isController": false}, {"data": ["2.4 Patient attending session", 296, 1, 0.33783783783783783, 1064.236486486488, 774, 2922, 943.5, 1411.9, 1734.9999999999977, 2557.0599999999945, 0.2563263241939143, 102.9755979747839, 1.1220585390655173], "isController": false}, {"data": ["Debug Sampler", 544, 0, 0.0, 0.5036764705882353, 0, 8, 0.0, 1.0, 1.0, 1.0, 0.4714720414479392, 3.0542307817725787, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 554, 0, 0.0, 1027.0126353790615, 507, 2977, 901.0, 1530.5, 1688.75, 2079.550000000002, 0.4678409982409516, 211.413466628169, 1.6604258398125933], "isController": false}, {"data": ["4.2 Vaccination batch", 514, 0, 0.0, 847.550583657588, 554, 1827, 836.0, 1035.5, 1188.25, 1498.3500000000013, 0.46656524470167055, 181.8976916919957, 2.0866866764760346], "isController": false}, {"data": ["1.1 Homepage", 565, 0, 0.0, 777.9451327433621, 536, 2338, 752.0, 959.8000000000001, 1102.499999999999, 1606.560000000001, 0.4705329764500327, 184.8964796221745, 1.9620532200903422], "isController": false}, {"data": ["1.3 Sign-in", 557, 0, 0.0, 836.6481149012571, 444, 2393, 754.0, 1247.0, 1312.3000000000002, 1726.4399999999905, 0.46791741467647757, 184.5550345986915, 2.14847261218257], "isController": false}, {"data": ["2.2 Session register", 548, 0, 0.0, 527.3339416058388, 330, 1973, 487.0, 717.2, 852.9499999999996, 1141.8899999999996, 0.4667488303597969, 192.90327031736152, 1.6656323674769757], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 125, 0, 0.0, 3737.064, 1958, 5567, 3676.0, 4472.6, 5208.499999999999, 5559.72, 0.11688382122198762, 135.4981377339079, 1.6862107495362049], "isController": true}, {"data": ["2.1 Open session", 551, 0, 0.0, 702.0290381125234, 358, 3078, 625.0, 1126.0, 1260.9999999999998, 1756.92, 0.4675276189183227, 183.12040712184142, 1.66431923980094], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, 100.0, 0.01362954886193267], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7337, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 296, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
