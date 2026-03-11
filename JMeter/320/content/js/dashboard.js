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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8886829939250372, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8750759878419453, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9985047846889952, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.5194231901118305, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.5008766803039159, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5023866348448688, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9997048406139315, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9997062279670975, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5073349633251834, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5048076923076923, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9982497082847142, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.9658344283837057, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.919941348973607, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9987995198079231, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9994169096209913, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9985388661601403, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9985320023487962, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.5059241706161137, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9788608338226659, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21097, 0, 0.0, 179.82552021614453, 0, 1667, 99.0, 411.0, 478.0, 649.0, 5.637124379861542, 155.90058083246115, 42.88939360331874], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1645, 0, 0.0, 468.54042553191493, 351, 1656, 426.0, 625.0, 693.0, 851.2399999999998, 0.4736129905277402, 10.071643355652405, 4.8945544178087115], "isController": false}, {"data": ["4.1 Vaccination questions", 1672, 0, 0.0, 128.8301435406699, 75, 754, 104.0, 204.70000000000005, 268.0, 394.27, 0.47436822776937987, 6.715025035992547, 4.459056021412391], "isController": false}, {"data": ["2.0 Register attendance", 1699, 0, 0.0, 772.0388463802244, 393, 2087, 751.0, 1036.0, 1137.0, 1358.0, 0.4752997969555076, 62.87570456585742, 15.749257997552025], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1711, 0, 0.0, 754.2378725891282, 231, 2102, 721.0, 941.5999999999999, 1040.7999999999997, 1225.7599999999998, 0.47620280172011914, 75.8570232202964, 15.738019833996287], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 419, 0, 0.0, 715.9642004773273, 195, 1932, 670.0, 913.0, 1011.0, 1189.6000000000001, 0.12091012136028793, 6.49483256896999, 3.453252707257695], "isController": true}, {"data": ["2.5 Select patient", 1694, 0, 0.0, 106.7343565525384, 61, 546, 88.0, 173.0, 237.25, 337.1999999999998, 0.4753145100556797, 11.989265810327765, 3.437101555388871], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["2.3 Search by first/last name", 1702, 0, 0.0, 103.7931844888366, 64, 568, 85.0, 169.0, 217.0, 325.0, 0.47629681743056057, 13.831097176444183, 3.571027769458208], "isController": false}, {"data": ["4.0 Vaccination for flu", 409, 0, 0.0, 708.5721271393643, 184, 1378, 674.0, 905.0, 1016.5, 1230.2999999999997, 0.11648386200108453, 6.145275496704703, 3.3111038957906604], "isController": true}, {"data": ["4.0 Vaccination for hpv", 416, 0, 0.0, 718.5072115384612, 178, 1857, 675.0, 926.3, 1024.15, 1225.2399999999996, 0.11927922090024272, 5.858676938341102, 3.3967204307241485], "isController": true}, {"data": ["1.2 Sign-in page", 1714, 0, 0.0, 104.38156359393214, 13, 591, 84.0, 172.0, 238.0, 384.39999999999964, 0.4766419048323536, 9.48386320175718, 4.055503395569539], "isController": false}, {"data": ["Debug Sampler", 1702, 0, 0.0, 0.3166862514688602, 0, 17, 0.0, 1.0, 1.0, 1.0, 0.47631094653227724, 2.7070559798817397, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 761, 0, 0.0, 353.8252299605785, 265, 1332, 320.0, 469.2000000000006, 530.0, 734.1199999999999, 0.2146199323538279, 6.649404801165632, 1.888823076535837], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 10.112147177419354, 19.027217741935484], "isController": false}, {"data": ["1.4 Open Sessions list", 1705, 0, 0.0, 429.05219941349, 336, 1667, 396.0, 548.4000000000001, 608.3999999999996, 755.8800000000001, 0.4752448974585966, 39.25831531363097, 3.4361617187308373], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 40.87611607142857, 87.75111607142857], "isController": false}, {"data": ["4.2 Vaccination batch", 1666, 0, 0.0, 121.5258103241297, 78, 760, 96.0, 196.0, 255.0, 402.9899999999998, 0.47391275283288037, 7.69286507602943, 4.212812756459764], "isController": false}, {"data": ["1.1 Homepage", 1715, 0, 0.0, 103.95860058309033, 28, 594, 87.0, 167.0, 216.0, 341.0, 0.47677308853606754, 17.504208284839393, 4.048127024548115], "isController": false}, {"data": ["1.3 Sign-in", 1711, 0, 0.0, 118.35067212156638, 61, 570, 87.0, 228.0, 313.0, 418.1599999999992, 0.4763730387894612, 9.684546116515667, 4.213885201736743], "isController": false}, {"data": ["2.2 Session register", 1703, 0, 0.0, 113.0082207868468, 63, 630, 83.0, 212.0, 259.0, 396.72000000000025, 0.4761054074447454, 17.02721013475139, 3.450538087960824], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 422, 0, 0.0, 709.2677725118498, 174, 1387, 679.0, 909.0, 966.2499999999998, 1118.54, 0.12155641758834948, 6.074884980030325, 3.465529785607029], "isController": true}, {"data": ["2.1 Open session", 1703, 0, 0.0, 290.1438637698179, 114, 1539, 279.0, 417.60000000000014, 486.5999999999999, 647.0, 0.4761393514215961, 10.836636290153812, 3.4465992758585884], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21097, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
